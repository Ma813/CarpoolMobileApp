using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class PartyMemberDTO
    {
        public int party_id { get; set; }
        public bool accepted { get; set; }
        public int user_id { get; set; }
        public string role { get; set; }
    }
}
