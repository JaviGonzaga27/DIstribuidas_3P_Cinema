namespace Movies.Application.DTOs
{
    public class MovieShowtimeDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public DateTime StartTime { get; set; }
        public string Room { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public bool IsSubtitled { get; set; }
    }
}
