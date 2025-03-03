using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/userworktime")]
    public class UserWorkTimeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserWorkTimeController(AppDbContext context)
        {
            _context = context;
        }
        
        
        /// <summary>
        /// Get all work times for the user
        /// </summary>
        /// <returns>Work times of the user</returns>
        [Authorize]
        [HttpGet(Name = "getUserWorkTimes")]
        public async Task<ActionResult<IEnumerable<UserWorkTime>>> GetUserWorkTimes()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
            if (user == null) return NotFound();



            var userWorkTimes = _context.User_Work_Times.Where(uwt => uwt.user_id == user.Id).ToList();
            return Ok(userWorkTimes);
        }
    }
}
