using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User_Preference
    {
        [Key]
        public int Id { get; set; }
        public int user_id { get; set; }
        public int other_user_id { get; set; }
        public bool liked { get; set; }
    }
}
