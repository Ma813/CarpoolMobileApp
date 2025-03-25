using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/addresses")]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
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
                await _context.SaveChangesAsync();
                return Ok("Addresses updated successfully.");
            }

            var address = new UserAddress
            {
                work_address = addressDto.work_address,
                home_address = addressDto.home_address,
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
    }
}
