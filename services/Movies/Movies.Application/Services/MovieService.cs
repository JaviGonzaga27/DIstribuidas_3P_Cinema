using Movies.Application.DTOs;
using Movies.Application.Interface;
using Movies.Domain;

namespace Movies.Application.Services;

public class MovieService : IMovieService
{
    private const string MOVIES_EXCHANGE = "movies.exchange";

    private readonly IMovieRepository _repo;
    private readonly IEventBus _bus;

    public MovieService(IMovieRepository repo, IEventBus bus)
    {
        _repo = repo;
        _bus = bus;
    }

    public async Task<IEnumerable<MovieDto>> GetAllAsync()
    {
        var list = await _repo.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<MovieDto?> GetByIdAsync(int id)
    {
        var movie = await _repo.GetByIdAsync(id);
        return movie is null ? null : MapToDto(movie);
    }

    public async Task<MovieDto> CreateAsync(CreateMovieDto dto)
    {
        var newMovie = new Movie
        {
            Title = dto.Title,
            Description = dto.Description,
            Genre = dto.Genre,
            DurationMinutes = dto.DurationMinutes,
            ReleaseDate = dto.ReleaseDate,
            PosterUrl = dto.PosterUrl
        };

        var movie = await _repo.AddAsync(newMovie);

        // Solo procesar showtimes si existen
        if (dto.Showtimes != null && dto.Showtimes.Any())
        {
            var showtimes = dto.Showtimes.Select(s => new
            {
                s.StartTime,
                s.Room,
                s.Price,
                s.TotalSeats,
                s.AvailableSeats,
                s.Language,
                s.Format,
                s.IsSubtitled,
                MovieId = movie.Id
            }).ToList();

            await _bus.PublishAsync(
                new { Event = "MovieCreated", Movie = movie, Showtimes = showtimes },
                MOVIES_EXCHANGE
            );
        }
        else
        {
            // Publicar evento solo con la película
            await _bus.PublishAsync(
                new { Event = "MovieCreated", Movie = movie, Showtimes = new List<object>() },
                MOVIES_EXCHANGE
            );
        }

        return MapToDto(movie);
    }


    public async Task<MovieDto?> UpdateAsync(int id, CreateMovieDto dto)
    {
        var movie = await _repo.GetByIdAsync(id);
        if (movie is null) return null;

        movie.Title = dto.Title;
        movie.Description = dto.Description;
        movie.Genre = dto.Genre;
        movie.DurationMinutes = dto.DurationMinutes;
        movie.ReleaseDate = dto.ReleaseDate;
        movie.PosterUrl = dto.PosterUrl;

        await _repo.UpdateAsync(movie);

        await _bus.PublishAsync(
            new { Event = "MovieUpdated", Movie = movie },
            MOVIES_EXCHANGE);

        return MapToDto(movie);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        if (ok)
        {
            await _bus.PublishAsync(
                new { Event = "MovieDeleted", MovieId = id },
                MOVIES_EXCHANGE);
        }
        return ok;
    }

    private static MovieDto MapToDto(Movie m) => new()
    {
        Id = m.Id,
        Title = m.Title,
        Description = m.Description,
        Genre = m.Genre,
        DurationMinutes = m.DurationMinutes,
        ReleaseDate = m.ReleaseDate,
        PosterUrl = m.PosterUrl
    };
}
