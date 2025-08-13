namespace Movies.Application.DTOs;

public class CreateMovieDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string PosterUrl { get; set; } = string.Empty;
    public List<MovieShowtimeDto> Showtimes { get; set; } = new();
}
