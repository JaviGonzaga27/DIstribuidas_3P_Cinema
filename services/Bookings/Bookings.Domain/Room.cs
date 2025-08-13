namespace Bookings.Domain;

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}
