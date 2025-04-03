using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/addresses")]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AddressController(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

        [Authorize]
        [HttpPost("addAddresses")]
        public async Task<ActionResult> AddAddresses([FromBody] UserAddressDto addressDto)
        {
            if (addressDto == null || string.IsNullOrEmpty(addressDto.work_address) || string.IsNullOrEmpty(addressDto.home_address))
            {
                return BadRequest("Work and Home addresses are required.");
            }

            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("User not found");

            var existingAddress = await _context.UserAddresses.FirstOrDefaultAsync(a => a.user_id == user.Id);
            if (existingAddress != null)
            {
                existingAddress.work_address = addressDto.work_address;
                existingAddress.home_address = addressDto.home_address;
                existingAddress.work_lat = addressDto.work_coordinates.latitude;
                existingAddress.work_lon = addressDto.work_coordinates.longitude;
                existingAddress.home_lat = addressDto.home_coordinates.latitude;
                existingAddress.home_lon = addressDto.home_coordinates.longitude;

                await _context.SaveChangesAsync();
                return Ok("Addresses updated successfully.");
            }

            var address = new UserAddress
            {
                work_address = addressDto.work_address,
                home_address = addressDto.home_address,
                work_lat = addressDto.work_coordinates.latitude,
                work_lon = addressDto.work_coordinates.longitude,
                home_lat = addressDto.home_coordinates.latitude,
                home_lon = addressDto.home_coordinates.longitude,
                user_id = user.Id
            };

            _context.UserAddresses.Add(address);
            await _context.SaveChangesAsync();

            return Ok("Addresses added successfully.");
        }

        [Authorize]
        [HttpGet("getAddresses")]
        public async Task<ActionResult<UserAddressDto>> GetAddresses()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var userAddress = await _context.UserAddresses.FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));
            return Ok(userAddress);
        }
        [Authorize]
        [HttpGet("getClosestColleagues")]
        public async Task<ActionResult<IEnumerable<UserAddressDto>>> GetClosestColleagues()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var userAddress = await _context.UserAddresses.FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));
            if (userAddress == null || userAddress.work_lat == null || userAddress.work_lon== null)
            {
                return NotFound("User address or coordinates not found");
            }
            if (userAddress.work_lat == null || userAddress.work_lon == null ||
    userAddress.work_lat < -90 || userAddress.work_lat > 90 ||
    userAddress.work_lon < -180 || userAddress.work_lon > 180)
            {
                return BadRequest("Invalid user coordinates");
            }


            var colleagues = await _context.UserAddresses.Where(a => a.user_id != int.Parse(userId) &&
                a.work_address == userAddress.work_address &&
                a.work_lat != null &&
                a.work_lon != null &&
                a.work_lat >= -90 && a.work_lat <= 90 &&
                a.work_lon >= -180 && a.work_lon <= 180)
                .ToListAsync();


            if (colleagues == null || colleagues.Count == 0)
            {
                return NotFound("No colleagues found with the same work address and valid coordinates");
            }

            // Build coordinates string
            var coordinates = $"{userAddress.home_lon},{userAddress.home_lat}";
            foreach (var colleague in colleagues)
            {
                coordinates += $";{colleague.home_lon},{colleague.home_lat}";
            }

            var accessToken = _configuration["Mapbox:AccessToken"];
            var url = $"https://api.mapbox.com/directions-matrix/v1/mapbox/driving/{coordinates}?access_token={accessToken}&annotations=distance&sources=0";
            Console.WriteLine("Mapbox request URL: " + url); // or use ILogger

            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(jsonString);
            var root = jsonDoc.RootElement;

            var distances = root.GetProperty("distances")[0];
            var result = new List<PartyColleagueDTO>();
            for (int i = 0; i < colleagues.Count; i++)
            {
                
                var c = colleagues[i];
                var user = await _context.Users.FindAsync(c.user_id);

                result.Add(new PartyColleagueDTO
                {
                    user_id = c.user_id,
                    user_name = user?.Username ?? "Unknown",
                    work_address = c.work_address,
                    home_address = c.home_address,
                    work_coordinates = new CoordinatesDto
                    {
                        latitude = c.work_lat,
                        longitude = c.work_lon
                    },
                    home_coordinates = new CoordinatesDto
                    {
                        latitude = c.home_lat,
                        longitude = c.home_lon
                    },
                    distance = distances[i+1].GetDouble()
                });
                
            }

            return Ok(result);
        }

    }
}
