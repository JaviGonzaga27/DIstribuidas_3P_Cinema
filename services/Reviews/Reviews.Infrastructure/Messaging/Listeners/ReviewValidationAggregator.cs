using Messaging.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Reviews.Application.Interface;
using System.Collections.Concurrent;
using System.Text.Json;

public sealed class ReviewValidationAggregator : BackgroundService
{
    private readonly IConnectionFactory _factory;
    private readonly IServiceProvider _serviceProvider;
    private readonly ConcurrentDictionary<(int, int), (bool? u, bool? m, ReviewCreateRequested)> _pending = new();

    public ReviewValidationAggregator(IConnectionFactory factory, IServiceProvider serviceProvider)
        => (_factory, _serviceProvider) = (factory, serviceProvider);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var conn = await _factory.CreateConnectionAsync(ct);
        var ch = await conn.CreateChannelAsync(null, ct);

        await ch.ExchangeDeclareAsync("review-ex", ExchangeType.Topic, durable: true, cancellationToken: ct);
        var q = await ch.QueueDeclareAsync(string.Empty, exclusive: true);
        await ch.QueueBindAsync(q.QueueName, "review-ex", "review.create.requested");
        await ch.QueueBindAsync(q.QueueName, "review-ex", "review.movie.validated");
        await ch.QueueBindAsync(q.QueueName, "review-ex", "review.user.validated");

        Console.WriteLine("[AGGREGATOR] 🟢 Service started. Waiting for messages...");

        var consumer = new AsyncEventingBasicConsumer(ch);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            using var scope = _serviceProvider.CreateScope();
            var _repo = scope.ServiceProvider.GetRequiredService<IReviewRepository>();

            var rk = ea.RoutingKey;
            Console.WriteLine($"[AGGREGATOR] 📩 Received message with routing key: {rk}");

            if (rk == "review.create.requested")
            {
                var evt = JsonSerializer.Deserialize<ReviewCreateRequested>(ea.Body.Span);
                if (evt != null)
                {
                    if (evt.UserId > 0 && evt.MovieId > 0)
                    {
                        _pending[(evt.UserId, evt.MovieId)] = (null, null, evt);
                        Console.WriteLine($"[AGGREGATOR] ➕ Review requested: user {evt.UserId}, movie {evt.MovieId}");
                    }
                    else
                    {
                        Console.WriteLine($"[AGGREGATOR] ❌ Invalid create request: user {evt.UserId}, movie {evt.MovieId}. Ignored.");
                    }
                }
            }
            else if (rk == "review.movie.validated")
            {
                var mv = JsonSerializer.Deserialize<ReviewMovieValidated>(ea.Body.Span);
                if (mv != null)
                {
                    foreach (var k in _pending.Keys)
                    {
                        if (k.Item2 == mv.MovieId)
                        {
                            _pending[k] = (_pending[k].u, mv.IsValid, _pending[k].Item3);
                            Console.WriteLine($"[AGGREGATOR] 🎬 Movie {mv.MovieId} validated: {mv.IsValid}");
                        }
                    }
                }
            }
            else if (rk == "review.user.validated")
            {
                var uv = JsonSerializer.Deserialize<ReviewUserValidated>(ea.Body.Span);
                if (uv != null)
                {
                    foreach (var k in _pending.Keys)
                    {
                        if (k.Item1 == uv.UserId)
                        {
                            _pending[k] = (uv.IsValid, _pending[k].m, _pending[k].Item3);
                            Console.WriteLine($"[AGGREGATOR] 👤 User {uv.UserId} validated: {uv.IsValid}");
                        }
                    }
                }
            }

            foreach (var kv in _pending.ToArray())
            {
                var (u, m, orig) = kv.Value;

                if (orig.UserId <= 0 || orig.MovieId <= 0)
                {
                    Console.WriteLine($"[AGGREGATOR] ❌ Skipped invalid review (userId={orig.UserId}, movieId={orig.MovieId})");
                    _pending.TryRemove(kv.Key, out var _);
                    continue;
                }

                if (u == true && m == true)
                {
                    await _repo.AddAsync(new()
                    {
                        UserId = orig.UserId,
                        MovieId = orig.MovieId,
                        Comment = orig.Comment,
                        Rating = orig.Rating
                    }, ct);

                    _pending.TryRemove(kv.Key, out var _);
                    Console.WriteLine($"[AGGREGATOR] ✅ Review saved: user {orig.UserId}, movie {orig.MovieId}");
                }
                else if (u == false || m == false)
                {
                    _pending.TryRemove(kv.Key, out var _);
                    Console.WriteLine($"[AGGREGATOR] ❌ Validation failed: user {orig.UserId}, movie {orig.MovieId} - (u={u}, m={m})");
                }
            }

            await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
        };

        await ch.BasicConsumeAsync(q.QueueName, autoAck: false, consumer, cancellationToken: ct);
        await Task.Delay(Timeout.Infinite, ct);
    }
}
