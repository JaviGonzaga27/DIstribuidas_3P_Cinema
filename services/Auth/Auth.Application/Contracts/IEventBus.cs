namespace Auth.Application.Contracts;

public interface IEventBus
{
    Task PublishAsync<T>(T @event, CancellationToken ct = default);
}
