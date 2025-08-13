using Bookings.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookings.Infrastructure.Configs;

public class SeatConfig : IEntityTypeConfiguration<Seat>
{
    public void Configure(EntityTypeBuilder<Seat> builder)
    {
        builder.ToTable("Seats");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Row).HasMaxLength(10).IsRequired();
        builder.Property(s => s.Number).IsRequired();
        builder.Property(s => s.RoomId).IsRequired();
        builder.HasIndex(s => new { s.RoomId, s.Row, s.Number }).IsUnique();
        builder.HasMany(s => s.BookingSeats)
               .WithOne(bs => bs.Seat)
               .HasForeignKey(bs => bs.SeatId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
