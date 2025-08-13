using Catalog.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Configs;

public class ShowtimeConfig : IEntityTypeConfiguration<Showtime>
{
    public void Configure(EntityTypeBuilder<Showtime> builder)
    {
        builder.ToTable("Showtimes");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.MovieId).IsRequired();
        builder.Property(s => s.StartTime).IsRequired();
        builder.Property(s => s.Room).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Price).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(s => s.TotalSeats).IsRequired();
        builder.Property(s => s.AvailableSeats).IsRequired();
        builder.Property(s => s.Language).HasMaxLength(20).HasDefaultValue("Español");
        builder.Property(s => s.Format).HasMaxLength(10).HasDefaultValue("2D");
        builder.Property(s => s.IsSubtitled).HasDefaultValue(false);
    }
}
