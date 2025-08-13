namespace Auth.Application.Interface
{
    public interface IRabbitRpcClient
    {
        Task<TReply> RequestAsync<TReq, TReply>(
            string exchange,
            string routingKey,
            TReq message,
            TimeSpan timeout,
            CancellationToken ct = default);
    }
}
