using Microsoft.AspNetCore.Mvc;

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

        [HttpGet(Name ="getUserWorkTimes")]
        public IActionResult GetUserWorkTimes()
        {
            var userWorkTimes = _context.User_Work_Times.ToList();
            return Ok(userWorkTimes);
        }
    }
}
