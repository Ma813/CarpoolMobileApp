using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Party_Member
    {
        [Key]
        public int Id { get; set; }
        public int party_id { get; set; }
        public bool accepted { get; set; }
        public int user_id { get; set; }
        public string role { get; set; }
    }
}
