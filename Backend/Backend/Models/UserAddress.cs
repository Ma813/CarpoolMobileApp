using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UserAddress
    {
        [Key]
        public int id { get; set; }
        public string? work_address { get; set; }
        public string? home_address { get; set; }
        public int user_id { get; set; }
        public double work_lat { get; set; }
        public double work_lon { get; set; }
        public double home_lat { get; set; }
        public double home_lon { get; set; }
    }
}