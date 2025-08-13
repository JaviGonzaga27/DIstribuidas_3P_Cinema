using Microsoft.EntityFrameworkCore;
using Movies.Application.Interface;
using Movies.Domain;

namespace Movies.Infrastructure.Repositories;

public class MovieRepository : IMovieRepository
{
    private readonly MoviesDbContext _context;

    public MovieRepository(MoviesDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        return await _context.Movies.AsNoTracking().ToListAsync();
    }

    public async Task<Movie?> GetByIdAsync(int id)
    {
        return await _context.Movies.FindAsync(id);
    }

    public async Task<Movie> AddAsync(Movie movie, CancellationToken ct = default)
    {
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync(ct);
        return movie;
    }


    public async Task UpdateAsync(Movie movie)
    {
        _context.Movies.Update(movie);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return false;

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> ExistsAsync(int id, CancellationToken ct)
    {
        return await _context.Movies.AnyAsync(m => m.Id == id, cancellationToken: ct);
    }

}
