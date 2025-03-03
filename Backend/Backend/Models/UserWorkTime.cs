using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UserWorkTime
    {
        [Key]
        public int id_user_work_times { get; set; }
        public TimeSpan start_time { get; set; }
        public TimeSpan end_time { get; set; }
        public string day { get; set; }
        public int user_id { get; set; } //foreign key
    }
}
