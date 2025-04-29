namespace Backend.DTO
{
    public class DestinationDto
    {
        public required double start_latitude { get; set; }
        public required double start_longitude { get; set; }
        public required string destination  { get; set; }
        public required double destination_latitude { get; set; }
        public required double destination_longitude { get; set; }
        public required string? mode_of_transport { get; set; }
    }
}