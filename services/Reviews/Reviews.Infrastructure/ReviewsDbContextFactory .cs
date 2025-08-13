using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Reviews.Infrastructure.Configs;

namespace Reviews.Infrastructure;

public class AuthDbContextFactory : IDesignTimeDbContextFactory<ReviewsDbContext>
{
    public ReviewsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ReviewsDbContext>();
        optionsBuilder.UseNpgsql(DbConfig.GetConnectionString());

        return new ReviewsDbContext(optionsBuilder.Options);
    }
}
