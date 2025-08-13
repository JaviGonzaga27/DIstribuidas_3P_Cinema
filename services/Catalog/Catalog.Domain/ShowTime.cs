﻿namespace Catalog.Domain
{
    public class Showtime
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public DateTime StartTime { get; set; }
        public string Room { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public string Language { get; set; } = "Español";
        public string Format { get; set; } = "2D";
        public bool IsSubtitled { get; set; } = false;
    }
}
