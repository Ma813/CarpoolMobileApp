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
            if (destinationDto.mode_of_transport != "car" || userCar == null || userCar.fuel_efficiency == null || userCar.fuel_type == null ||
            userCar.fuel_efficiency == null || userCar.fuel_efficiency <= 0
            || (userCar.fuel_type != "Petrol" && userCar.fuel_type != "Diesel"))
            {
                destination.co2_emission = distance * 0.08 * 2.31; // Default value for unknown car
                destination.default_car = true;
            }
            else
            {
                var fuelConsumption = userCar.fuel_efficiency / 100 * distance; // in liters
                destination.co2_emission = fuelConsumption * (userCar.fuel_type == "Petrol" ? 2.31 : 2.68);
                destination.default_car = false;
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
        public async Task<ActionResult> OptimalPassengerPickup()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null) return Unauthorized();

            // Gauti vartotojo namų adresą
            var userAddress = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));

            if (userAddress == null || string.IsNullOrEmpty(userAddress.home_address))
                return BadRequest("User home address not found");

            double userLatitude = userAddress.home_lat;
            double userLongitude = userAddress.home_lon;

            //Get party id
            var party = await _context.Party
                .Join(_context.Party_Members,
                      party => party.Id,
                      member => member.party_id,
                      (party, member) => new { party, member })
                .Where(pm => pm.party.user_id == int.Parse(userId) && pm.member.role == "driver")
                .FirstOrDefaultAsync();

            if (party == null)
            {
                return NotFound("Driver party not found");
            }

            int memberCount = await _context.Party_Members
                .Where(m => m.party_id == party.party.Id)
                .CountAsync();

            if (memberCount <= 1)
            {
                return BadRequest("Not enough members in the party");
            }

            var members = await _context.Party_Members
                .Where(m => m.party_id == party.party.Id && m.role == "passenger")
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

            // 5. Surinkti optimizuotą seką
            var optimizedRoute = waypoints.EnumerateArray().Skip(1) // Skip the first waypoint (user's home)
                .Select(wp => new
                {
                    Order = wp.GetProperty("waypoint_index").GetInt32() - 1, // Skip driver's home
                    Longitude = wp.GetProperty("location")[0].GetDouble(),
                    Latitude = wp.GetProperty("location")[1].GetDouble(),
                })
                .OrderBy(wp => wp.Order)
                .ToList();

            var optimizedNoDuplicates = optimizedRoute
                .GroupBy(x => new { x.Latitude, x.Longitude })
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

            var routesWithNames = new List<object>();
            System.Console.WriteLine("Passengers: " + JsonSerializer.Serialize(passengers));
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
                    Order = optimizedRoute.Count,
                    Longitude = workAddress.work_lon,
                    Latitude = workAddress.work_lat,
                    Usernames = "Work",
                    Address = workAddress.work_address
                });
            }

            return Ok(routesWithNames);
        }
    }
}
