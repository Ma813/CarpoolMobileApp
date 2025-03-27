using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/destinations")]
    public class DestinationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DestinationController(AppDbContext context)
        {
            _context = context;
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
                place_name = destinationDto.place_name,
                latitude = destinationDto.latitude,
                longitude = destinationDto.longitude,
                date = DateTime.UtcNow,
                user_id = user.Id
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return Ok("Destination added successfully.");
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

            var lastDestinations = await _context.Destinations
                .Where(d => d.user_id == int.Parse(userId))
                .OrderByDescending(d => d.date)
                .Take(5)
                .ToListAsync();

            return Ok(lastDestinations);
        }
    }
}
