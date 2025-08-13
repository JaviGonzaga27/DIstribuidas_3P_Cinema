namespace Bookings.Application.DTOs
{
    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int ShowtimeId { get; set; }
        public List<int> SeatIds { get; set; } = new();
    }
    public record BookingDto(
      int Id,
      int UserId,
      string UserName,
      int ShowtimeId,
      string MovieTitle,
      DateTime ShowtimeDate,
      string Room,
      List<int> SeatIds,
      DateTime BookingDate,
      string Status);
}
