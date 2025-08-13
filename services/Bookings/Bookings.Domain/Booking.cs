namespace Bookings.Domain;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ShowtimeId { get; set; }
    public DateTime BookingDate { get; set; }
    public string Status { get; set; } = "Confirmed";

    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}
