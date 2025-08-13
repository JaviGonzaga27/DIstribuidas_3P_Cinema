namespace Catalog.Application.Interface
{
    public interface INotificationService
    {
        Task NotifyTicketSoldAsync(int showtimeId, int remainingSeats);
        Task NotifyTicketReleasedAsync(int showtimeId, int remainingSeats);
    }
}
