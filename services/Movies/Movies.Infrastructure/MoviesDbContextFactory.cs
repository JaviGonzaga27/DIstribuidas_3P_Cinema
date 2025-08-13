using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Movies.Infrastructure.Configs;

namespace Movies.Infrastructure;

public class AuthDbContextFactory : IDesignTimeDbContextFactory<MoviesDbContext>
{
    public MoviesDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MoviesDbContext>();
        optionsBuilder.UseNpgsql(DbConfig.GetConnectionString());

        return new MoviesDbContext(optionsBuilder.Options);
    }
}
