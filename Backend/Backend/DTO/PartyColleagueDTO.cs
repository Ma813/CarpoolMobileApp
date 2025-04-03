namespace Backend.DTO
{
    public class PartyColleagueDTO
    {
        public int user_id { get; set; }
        public string user_name { get; set; } = string.Empty;
        public required string work_address { get; set; }
        public required string home_address { get; set; }
        public required CoordinatesDto work_coordinates { get; set; }
        public required CoordinatesDto home_coordinates { get; set; }
        public double distance { get; set; } = 0.0;
    }
}
