using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Car
    {
        [Key]
        public int id { get; set; }
        public string? brand { get; set; }
        public string? model { get; set; }
        public int user_id { get; set; }
    }
}