namespace Movies.Application.Interface;

public interface IEventBus
{
    Task PublishAsync<T>(T @event, CancellationToken ct = default);
}
