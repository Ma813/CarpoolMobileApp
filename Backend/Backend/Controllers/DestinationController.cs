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
            if (userCar == null || userCar.fuel_efficiency == null || userCar.fuel_type == null ||
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
    }
}
