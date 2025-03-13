using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/cars")]
    public class CarController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("addCar")]
        public async Task<ActionResult> AddCar([FromBody] CarsDto carDto)
        {
            Console.WriteLine(carDto);
            if (carDto == null || string.IsNullOrEmpty(carDto.brand) || string.IsNullOrEmpty(carDto.model) || string.IsNullOrEmpty(carDto.licensePlate))
            {
                return BadRequest("All fields are required.");
            }

            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("User not found");

            var car = new Car
            {
                brand = carDto.brand,
                model = carDto.model,
                license_plate = carDto.licensePlate,
                user_id = user.Id
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            return Ok("Car added successfully.");
        }

        [Authorize]
        [HttpGet("userCars")]
        public async Task<ActionResult<IEnumerable<Car>>> GetUserCars()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var userCars = await _context.Cars.Where(c => c.user_id == int.Parse(userId)).ToListAsync();
            return Ok(userCars);
        }
    }
}
