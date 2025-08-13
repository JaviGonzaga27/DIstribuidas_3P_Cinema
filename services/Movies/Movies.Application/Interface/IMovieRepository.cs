using Movies.Domain;


namespace Movies.Application.Interface
{
    public interface IMovieRepository
    {
        Task<IEnumerable<Movie>> GetAllAsync();
        Task<Movie?> GetByIdAsync(int id);
        Task<Movie> AddAsync(Movie movie, CancellationToken ct = default);
        Task UpdateAsync(Movie movie);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id, CancellationToken ct);

    }
}
