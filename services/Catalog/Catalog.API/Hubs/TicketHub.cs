using Microsoft.AspNetCore.SignalR;


namespace Catalog.API.Hubs
{
    public class TicketHub : Hub
    {
        public async Task Notify(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong");
        }
    }
}
