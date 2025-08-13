namespace Catalog.Application.Interface
{
    public interface IRoutingEventBus
    {
        Task PublishAsync(string routingKey, object message, CancellationToken ct = default);
    }
}
