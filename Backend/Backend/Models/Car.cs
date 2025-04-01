using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Car
    {
        [Key]
        public int id { get; set; }
        public string? brand { get; set; }
        public string? model { get; set; }
        public string? license_plate { get; set; }
        public int user_id { get; set; }
        public double? fuel_efficiency { get; set; }
        public required string fuel_type { get; set; }
    }
}