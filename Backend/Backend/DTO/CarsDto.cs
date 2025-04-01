namespace Backend.DTO
{
    public class CarsDto
    {
        public required string brand { get; set; }
        public required string model { get; set; }
        public required string licensePlate { get; set; }
        public double? fuelEfficiency { get; set; }
        public required string fuelType { get; set; }
    }
}