namespace Reviews.Application.Messaging;

public interface IEventBus
{
    Task PublishAsync<T>(T @event, string queueName, CancellationToken ct);
}
