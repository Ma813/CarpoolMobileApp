using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class PartyDTO
    {
        public int party_id { get; set; }
        public string driver_name { get; set; }
        public int user_id { get; set; }
        public List<PartyColleagueDTO> colleague_list { get; set; } = new List<PartyColleagueDTO>();
    }
}
