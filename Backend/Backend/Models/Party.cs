using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Party
    {
        [Key]
        public int Id { get; set; }
        public int user_id { get; set; }
        public bool active { get; set; }
    }
}
