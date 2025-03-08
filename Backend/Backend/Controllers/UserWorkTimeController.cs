using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

        [HttpPost("saveWorkTimes")]
        public IActionResult SaveUserWorkTimes([FromBody] Dictionary<string, UserWorkTimeDTO> workTimes)
        {
            if (workTimes == null || workTimes.Count == 0)
            {
                return BadRequest("Invalid work time data.");
            }

            var newWorkTimes = new List<UserWorkTime>();

            foreach (var entry in workTimes)
            {
                string day = entry.Key;
                var workTimeDto = entry.Value;
                if (string.IsNullOrEmpty(workTimeDto.start_time) || string.IsNullOrEmpty(workTimeDto.end_time))
                {
                    return BadRequest($"Start and End time must be provided for {day}.");
                }

                var newWorkTime = new UserWorkTime
                {
                    day = day,
                    start_time = TimeSpan.Parse(workTimeDto.start_time),
                    end_time = TimeSpan.Parse(workTimeDto.end_time),
                    user_id = workTimeDto.id_user
                };

                newWorkTimes.Add(newWorkTime);
            }

            _context.User_Work_Times.AddRange(newWorkTimes);
            _context.SaveChanges();

            return Ok("Work times saved successfully.");
        }
    }
}
