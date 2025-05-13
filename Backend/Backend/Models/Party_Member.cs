using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Party_Member
    {
        [Key]
        public int Id { get; set; }
        public int party_id { get; set; }
        public bool accepted { get; set; }
        public bool invited { get; set; }
        public int user_id { get; set; }
        public string ?role { get; set; }

        [ForeignKey("party_id")]
        public Party ?party { get; set; } // <--- šito trūko
    }
}
