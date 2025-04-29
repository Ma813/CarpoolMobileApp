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

            string accessToken = _configuration["Mapbox:AccessToken"];
            using var httpClient = new HttpClient();
            
            // Konvertuoti vartotojo adresą į koordinates
            string userGeocodeUrl = $"https://api.mapbox.com/geocoding/v5/mapbox.places/{Uri.EscapeDataString(userAddress.home_address)}.json?access_token={accessToken}";
            var userGeocodeResponse = await httpClient.GetStringAsync(userGeocodeUrl);
            var userGeocodeJson = JsonDocument.Parse(userGeocodeResponse);
            var userFeatures = userGeocodeJson.RootElement.GetProperty("features");

            if (userFeatures.GetArrayLength() == 0) return BadRequest("Could not determine user location");

            var userFirstFeature = userFeatures[0].GetProperty("center");
            double userLongitude = userFirstFeature[0].GetDouble();
            double userLatitude = userFirstFeature[1].GetDouble();

            // 2. Gauti kolegų namų adresus
            var colleagues = await _context.UserAddresses
                .Where(a => a.user_id != int.Parse(userId) && a.home_address != null)
                .Select(a => new { a.user_id, a.home_address })
                .ToListAsync();

            if (!colleagues.Any()) return NotFound("No colleagues found");

            List<string> coordinatesList = new List<string>();
            
            // 3. Konvertuoti kolegų adresus į koordinates
            foreach (var col in colleagues)
            {
                string geocodeUrl = $"https://api.mapbox.com/geocoding/v5/mapbox.places/{Uri.EscapeDataString(col.home_address)}.json?access_token={accessToken}";
                var geocodeResponse = await httpClient.GetStringAsync(geocodeUrl);
                var geocodeJson = JsonDocument.Parse(geocodeResponse);
                
                var features = geocodeJson.RootElement.GetProperty("features");
                if (features.GetArrayLength() > 0)
                {
                    var firstFeature = features[0].GetProperty("center");
                    double longitude = firstFeature[0].GetDouble();
                    double latitude = firstFeature[1].GetDouble();
                    coordinatesList.Add($"{longitude},{latitude}");
                }
            }

            if (!coordinatesList.Any()) return BadRequest("Failed to retrieve coordinates for colleagues");
            
            // 4. Sudaryti Mapbox Optimization API užklausą
            string coordinates = $"{userLongitude},{userLatitude};" + string.Join(";", coordinatesList);
            string optimizeUrl = $"https://api.mapbox.com/optimized-trips/v1/mapbox/driving/{coordinates}?access_token={accessToken}&geometries=geojson";
            
            var response = await httpClient.GetStringAsync(optimizeUrl);
            var jsonDoc = JsonDocument.Parse(response);
            
            var waypoints = jsonDoc.RootElement.GetProperty("waypoints");
            if (waypoints.GetArrayLength() == 0) return BadRequest("Could not optimize route");
            
            // 5. Surinkti optimizuotą seką
            var optimizedRoute = waypoints.EnumerateArray()
                .Select(wp => new
                {
                    Order = wp.GetProperty("waypoint_index").GetInt32(),
                    Longitude = wp.GetProperty("location")[0].GetDouble(),
                    Latitude = wp.GetProperty("location")[1].GetDouble()
                })
                .OrderBy(wp => wp.Order)
                .ToList();
            
            return Ok(optimizedRoute);
        }
    }
}
