namespace Movies.Application.Interface;

public interface IEventBus
{
    Task PublishAsync<T>(string routingKey, T message, CancellationToken ct = default);
}
