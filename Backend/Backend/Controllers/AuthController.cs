using Backend.Models;
using Backend.Services;
using Backend.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Microsoft.CodeAnalysis.Scripting;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/Auth")]
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

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginModel.Password, user.Password))
            {
                return Unauthorized();
            }

            string token = Auth.GenerateToken(user, _configuration);

            return Ok(new { Token = token });
        }

        [HttpPost("signup")]
        public async Task<ActionResult<User>> Signup([FromBody] SignupDto signup)
        {
            var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Username == signup.Username);
            if (existingUser != null)
            {
                return Conflict("User with such username already exists");
            }
            if (signup.Username == "" || signup.Password == "")
            {
                return BadRequest("Username and password cannot be empty.");
            }

            if (signup.Password.Length < 5)
            {
                return BadRequest("Password must be at least 5 characters long.");
            }

            if (!signup.Password.Any(char.IsUpper) || !signup.Password.Any(char.IsLower))
            {
                return BadRequest("Password must contain both uppercase and lowercase letters.");
            }
            if (!signup.Password.Any(char.IsDigit) && !signup.Password.Any(ch => "!@#$%^&*()-_=+[]{}|;:'\",.<>?/".Contains(ch)))
            {
                return BadRequest("Password must contain at least one special character or a number.");
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(signup.Password);


            var user = new User
            {
                Username = signup.Username,
                Password = hashedPassword,
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(user.Username + " Account has been created");
        }
        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file, [FromQuery] string username)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user == null)
                return NotFound("User not found");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            user.ImagePath = imageUrl;
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl });
        }
    }

    public class LoginModel
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}