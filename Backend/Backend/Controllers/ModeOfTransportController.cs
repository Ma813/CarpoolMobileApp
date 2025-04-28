using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/modeOfTransport")]
    [ApiController]
    [Authorize]
    public class ModeOfTransportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ModeOfTransportController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetModeOfTransport()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
                return Unauthorized("User not found");

            var user = await _context.Users.FindAsync(int.Parse(userId));

            if (user == null)
                return NotFound("User not found");

            return Ok(user.ModeOfTransport);
        }

        [HttpPost]
        public async Task<IActionResult> SetModeOfTransport([FromBody] string mode)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
                return Unauthorized("User not found");

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
                return NotFound("User not found");

            user.ModeOfTransport = mode;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Mode of transport updated");
        }
    }
}
