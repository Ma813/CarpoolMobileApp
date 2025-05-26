using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/destinations")]
    public class DestinationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public DestinationController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [Authorize]
        [HttpPost("addDestination")]
        public async Task<ActionResult> AddDestination([FromBody] DestinationDto destinationDto)
        {
            // if (destinationDto == null || string.IsNullOrEmpty(destinationDto.PlaceName))
            // {
            //     return BadRequest("All fields are required.");
            // }
            System.Console.WriteLine("DestinationDto: " + destinationDto.ToString());
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("User not found");

            var destination = new Destination
            {
                place_name = destinationDto.destination,
                latitude = destinationDto.destination_latitude,
                longitude = destinationDto.destination_longitude,
                date = DateTime.UtcNow,
                user_id = user.Id
            };

            string start = $"{destinationDto.start_longitude},{destinationDto.start_latitude}";
            string end = $"{destinationDto.destination_longitude},{destinationDto.destination_latitude}";

            //NOTE
            // Mapbox API access token should be stored in appsettings.json
            // Add the following lines to your appsettings.json file:
            /*
            "Mapbox": {
                "AccessToken": "YOUR_MAPBOX_ACCESS_TOKEN"
            }
            */
            // and make sure to replace the value with your actual Mapbox access token.



            string access_token = _configuration["Mapbox:AccessToken"];
            if (string.IsNullOrEmpty(access_token))
            {
                return BadRequest("Mapbox access token is not set.");
            }
            string accessToken = access_token;

            string url = $"https://api.mapbox.com/directions/v5/mapbox/driving/{start};{end}?access_token={accessToken}&geometries=geojson";

            var distance = 0.0;

            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.GetStringAsync(url);
                var jsonDoc = JsonDocument.Parse(response);
                var routes = jsonDoc.RootElement.GetProperty("routes");
                if (routes.GetArrayLength() > 0)
                {
                    distance = routes[0].GetProperty("distance").GetDouble() / 1000; // Convert meters to km
                }
            }

            var userCar = await _context.Cars.FirstOrDefaultAsync(c => c.user_id == user.Id);


            if (destinationDto.mode_of_transport == "bicycle" || destinationDto.mode_of_transport == "walk" || destinationDto.mode_of_transport == "bus")
            {
                // For bike or walk, we can assume a default emission value
                destination.co2_emission = 0;
                destination.co2_saved = distance * 0.08 * 2.31; // Default value for unknown car
                destination.default_car = true; // Indicating that no car was used
            }

            else if (userCar != null && (userCar.fuel_type == "Petrol" || userCar.fuel_type == "Diesel"))
            {
                // For car, we calculate the CO2 emission based on fuel efficiency
                if (userCar.fuel_efficiency == null || userCar.fuel_efficiency <= 0)
                {
                    destination.co2_emission = distance * 0.08 * 2.31; // Default value for unknown car
                    destination.co2_saved = 0;
                    destination.default_car = true;
                }
                else
                {
                    var fuelConsumption = userCar.fuel_efficiency / 100 * distance; // in liters
                    destination.co2_emission = fuelConsumption * (userCar.fuel_type == "Petrol" ? 2.31 : 2.68);
                    destination.co2_saved = 0;
                    destination.default_car = false;
                }
            }
            else
            {
                // If no car or invalid car data, use default values
                destination.co2_emission = distance * 0.08 * 2.31; // Default value for unknown car
                destination.co2_saved = 0;
                destination.default_car = true;
            }

            destination.mode_of_transport = destinationDto.mode_of_transport;

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return Ok(destination);
        }



        [Authorize]
        [HttpGet("getDestinations")]
        public async Task<ActionResult<IEnumerable<Destination>>> GetUserDestinations()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var userDestinations = await _context.Destinations
                .Where(d => d.user_id == int.Parse(userId))
                .ToListAsync();

            return Ok(userDestinations);
        }
        [Authorize]
        [HttpGet("last")]
        public async Task<ActionResult<IEnumerable<Destination>>> GetLastAddresses()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null) return Unauthorized();

            // Pirmiausia paimam daugiau nei reikia
            var destinations = await _context.Destinations
                .Where(d => d.user_id == int.Parse(userId))
                .OrderByDescending(d => d.date)
                .Take(50) // apsidraudimui paimam daugiau nei 5
                .ToListAsync();

            // Po to jau grupuojam in-memory, nes jeigu viska darau taip, tada nelabai draugauja su EF Core SQL generatoriumi (ypač MySQL).
            var lastDestinations = destinations
                .GroupBy(d => d.place_name)
                .Select(g => g.First())
                .OrderByDescending(d => d.date)
                .Take(5)
                .ToList();

            return Ok(lastDestinations);
        }

        [Authorize]
        [HttpGet("optimalPickup")]
        public async Task<ActionResult> OptimalPassengerPickup([FromQuery] string id)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null) return Unauthorized();

            var partyId = int.Parse(id);
            if (partyId <= 0) return BadRequest("Invalid party ID");


            var homeAddress = await _context.UserAddresses
                .Where(a => a.user_id == int.Parse(userId))
                .Select(a => new { a.home_lat, a.home_lon, a.home_address })
                .FirstOrDefaultAsync();
            var routesWithNames = new List<object>();
            if (homeAddress != null)
            {
                routesWithNames.Add(new
                {
                    Order = 0,
                    Longitude = homeAddress.home_lon,
                    Latitude = homeAddress.home_lat,
                    Usernames = "Home",
                    Address = homeAddress.home_address
                });
            }

            // Gauti vartotojo namų adresą
            var userAddress = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));

            if (userAddress == null || string.IsNullOrEmpty(userAddress.home_address))
                return BadRequest("User home address not found");

            double userLatitude = userAddress.home_lat;
            double userLongitude = userAddress.home_lon;

            //Get party
            var party = await _context.Party
                .Join(_context.Party_Members,
                      party => party.Id,
                      member => member.party_id,
                      (party, member) => new { party, member })
                .Where(p => p.party.Id == partyId)
                .FirstOrDefaultAsync();

            if (party == null)
            {
                return NotFound("Party not found");
            }
            if (party.member.user_id != int.Parse(userId))
            {
                return Unauthorized("You are not the driver of this party");
            }

            if (party == null)
            {
                return NotFound("Driver party not found");
            }

            int memberCount = await _context.Party_Members
                .Where(m => m.party_id == party.party.Id && m.accepted)
                .CountAsync();

            if (memberCount <= 1)
            {
                // If there are no passengers, return the user's home address and work address only
                var work = await _context.UserAddresses
                    .Where(a => a.user_id == int.Parse(userId))
                    .Select(a => new { a.work_lat, a.work_lon, a.work_address })
                    .FirstOrDefaultAsync();
                if (work != null)
                {
                    routesWithNames.Add(new
                    {
                        Order = 1,
                        Longitude = work.work_lon,
                        Latitude = work.work_lat,
                        Usernames = "Work",
                        Address = work.work_address
                    });
                }


                return Ok(routesWithNames);
            }

            var members = await _context.Party_Members
                .Where(m => m.party_id == party.party.Id && m.role == "passenger" && m.accepted)
                .Select(m => new { m.user_id })
                .ToListAsync();

            //get addresses of passengers
            var passengers = await _context.UserAddresses
                .Where(a => members.Select(m => m.user_id).Contains(a.user_id) && a.home_address != null)
                .Select(a => new { a.user_id, a.home_lat, a.home_lon, a.home_address })
                .ToListAsync();

            List<string> coordinatesList = new List<string>();

            foreach (var passenger in passengers)
            {
                double longitude = passenger.home_lon;
                double latitude = passenger.home_lat;
                coordinatesList.Add($"{longitude},{latitude}");
            }

            if (!coordinatesList.Any()) return BadRequest("Failed to retrieve coordinates for colleagues");

            // 4. Sudaryti Mapbox Optimization API užklausą
            string coordinates = $"{userLongitude},{userLatitude};" + string.Join(";", coordinatesList);
            string accessToken = _configuration["Mapbox:AccessToken"];
            string optimizeUrl = $"https://api.mapbox.com/optimized-trips/v1/mapbox/driving/{coordinates}?access_token={accessToken}&geometries=geojson";

            var httpClient = new HttpClient();
            var response = await httpClient.GetStringAsync(optimizeUrl);
            var jsonDoc = JsonDocument.Parse(response);

            var waypoints = jsonDoc.RootElement.GetProperty("waypoints");
            if (waypoints.GetArrayLength() == 0) return BadRequest("Could not optimize route");


            var optimizedRoute = waypoints.EnumerateArray().Skip(1) // Skip the first waypoint (user's home)
                .Select(wp => new
                {
                    Order = wp.GetProperty("waypoint_index").GetInt32(),
                    Longitude = wp.GetProperty("location")[0].GetDouble(),
                    Latitude = wp.GetProperty("location")[1].GetDouble(),
                })
                .OrderBy(wp => wp.Order)
                .ToList();

            // This part checks if two users live at the same address (or very close) and combines them into one waypoint.
            // It groups waypoints by rounded latitude and longitude to avoid duplicates.
            var optimizedNoDuplicates = optimizedRoute
                .GroupBy(x => new { RoundedLatitude = Math.Round(x.Latitude, 4), RoundedLongtitude = Math.Round(x.Longitude, 4) })
                .Select(g =>
                {
                    var first = g.First();
                    return new
                    {
                        first.Order,
                        first.Longitude,
                        first.Latitude,
                        Count = g.Count()
                    };
                })
                .OrderBy(wp => wp.Order)
                .ToList();

            System.Console.WriteLine("Passengers: " + JsonSerializer.Serialize(optimizedNoDuplicates));
            foreach (var route in optimizedNoDuplicates)
            {
                System.Console.WriteLine("Route: " + JsonSerializer.Serialize(route));
                var n = route.Count;
                // get n closest passengers
                var matchingPassengers = passengers
                    .OrderBy(p => Math.Sqrt(Math.Pow(p.home_lat - route.Latitude, 2) + Math.Pow(p.home_lon - route.Longitude, 2)))
                    .Take(route.Count)
                    .ToList();
                System.Console.WriteLine("Matching passengers: " + JsonSerializer.Serialize(matchingPassengers));
                var usernames = new List<string>();
                foreach (var passenger in matchingPassengers)
                {
                    var user = await _context.Users.FindAsync(passenger.user_id);
                    if (user != null)
                    {
                        usernames.Add(user.Username);
                    }
                }

                var address = matchingPassengers[0].home_address;

                var usernamesJoined = string.Join(", ", usernames);

                routesWithNames.Add(new
                {
                    route.Order,
                    route.Longitude,
                    route.Latitude,
                    Usernames = usernamesJoined,
                    Address = address
                });
            }


            System.Console.WriteLine("Optimized route: " + JsonSerializer.Serialize(optimizedRoute));

            //add waypoint to work
            var workAddress = await _context.UserAddresses
                .Where(a => a.user_id == int.Parse(userId))
                .Select(a => new { a.work_lat, a.work_lon, a.work_address })
                .FirstOrDefaultAsync();
            if (workAddress != null)
            {
                routesWithNames.Add(new
                {
                    Order = optimizedRoute.Count + 1,
                    Longitude = workAddress.work_lon,
                    Latitude = workAddress.work_lat,
                    Usernames = "Work",
                    Address = workAddress.work_address
                });
            }


            return Ok(routesWithNames);
        }
        [Authorize]
        [HttpGet("summary")]
        public async Task<ActionResult> GetUserSummary()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null) return Unauthorized();

            int uid = int.Parse(userId);

            var destinations = await _context.Destinations
                .Where(d => d.user_id == uid)
                .OrderByDescending(d => d.date)
                .ToListAsync();

            if (!destinations.Any())
            {
                return Ok(new
                {
                    total_rides = 0,
                    total_emissions = 0,
                    last_ride = (object?)null,
                    top_destinations = new List<object>()
                });
            }

            var totalRides = destinations.Count;
            var totalEmissions = destinations.Sum(d => d.co2_saved);

            var lastRide = destinations.First(); // Jau surikiuota pagal datą

            var topDestinations = destinations
                .GroupBy(d => d.place_name)
                .Select(g => new
                {
                    place_name = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(g => g.count)
                .Take(5)
                .ToList();

            return Ok(new
            {
                total_rides = totalRides,
                total_emissions = Math.Round((double)(totalEmissions ?? 0), 2),
                last_ride = new
                {
                    place_name = lastRide.place_name,
                    date = lastRide.date?.ToString("yyyy-MM-dd") ?? "N/A",
                    transport = lastRide.mode_of_transport,
                    emissions = Math.Round(lastRide.co2_saved ?? 0, 2)
                },
                top_destinations = topDestinations
            });
        }
    }
}
