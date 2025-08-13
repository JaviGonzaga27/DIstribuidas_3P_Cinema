using Microsoft.EntityFrameworkCore;
using Movies.Domain;
using Movies.Infrastructure.Configs;

namespace Movies.Infrastructure;

public class MoviesDbContext : DbContext
{
    public MoviesDbContext(DbContextOptions<MoviesDbContext> options) : base(options) { }

    public DbSet<Movie> Movies => Set<Movie>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new MovieConfig());
    }
}
