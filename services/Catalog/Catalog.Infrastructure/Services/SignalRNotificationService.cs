using Catalog.Application.Interface;
using Microsoft.AspNetCore.SignalR;

namespace Catalog.Infrastructure.Services
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<Hub> _hubContext;

        public SignalRNotificationService(IHubContext<Hub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task NotifyTicketSoldAsync(int showtimeId, int remainingSeats)
        {
            return _hubContext.Clients.All.SendAsync("TicketSold", new { showtimeId, remainingSeats });
        }

        public Task NotifyTicketReleasedAsync(int showtimeId, int remainingSeats)
        {
            return _hubContext.Clients.All.SendAsync("TicketReleased", new { showtimeId, remainingSeats });
        }
    }
}
