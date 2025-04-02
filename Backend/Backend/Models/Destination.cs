using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Destination
    {
        [Key]
        public int id { get; set; }
        public string? place_name { get; set; }
        public double? latitude { get; set; }
        public double? longitude { get; set; }
        public DateTime? date { get; set; }
        public int user_id { get; set; }
        public double? co2_emission { get; set; }
        public bool? default_car { get; set; }
    }
}