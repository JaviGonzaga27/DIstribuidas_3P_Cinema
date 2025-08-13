namespace Bookings.Application.Interface
{
    public interface IRabbitRpcClient : IAsyncDisposable
    {
        Task<TReply> RequestAsync<TReq, TReply>(
            string exchange,
            string routingKey,
            TReq message,
            TimeSpan timeout,
            CancellationToken ct = default);
    }
}
