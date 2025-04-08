namespace Backend.DTO
{
    public class SignupDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public string ImagePath { get; set; } = "default.png";
    }
}