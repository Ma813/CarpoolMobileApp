using Backend.Models;
using Backend.Services;
using Backend.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginModel loginModel)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginModel.Username);

            if (user == null || loginModel.Password != user.Password) // hashing needed
            {
                return Unauthorized();
            }

            string token = Auth.GenerateToken(user, _configuration);

            return Ok(new { Token = token });
        }

        [HttpPost("signup")]
        public async Task<ActionResult<User>> Signup([FromBody] SignupDto signup)
        {
            if (signup.Username == "" || signup.Password == "")
            {
                return BadRequest();
            }

            var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Username == signup.Username);

            if (existingUser != null) {
                return Conflict("User with such username already exists");
            }

            var user = new User
            {
                Username = signup.Username,
                Password = signup.Password,
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(user);
        }
    }

    public class LoginModel
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}