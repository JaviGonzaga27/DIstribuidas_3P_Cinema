using Messaging.Events;
using RabbitMQ.Client;
using System.Text.Json;

public sealed class ReviewEventPublisher : IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;

    public ReviewEventPublisher(IConnectionFactory factory)
    {
        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();
        _ch.ExchangeDeclareAsync("review-ex", ExchangeType.Topic, durable: true).GetAwaiter().GetResult();
    }

    public async Task PublishReviewRequestedAsync(ReviewCreateRequested evt, CancellationToken ct = default)
    {
        await _ch.BasicPublishAsync(
            exchange: "review-ex",
            routingKey: "review.create.requested",
            body: JsonSerializer.SerializeToUtf8Bytes(evt),
            cancellationToken: ct);
    }

    public async ValueTask DisposeAsync()
    {
        await _ch.CloseAsync();
        await _conn.CloseAsync();
    }
}
