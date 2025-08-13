namespace Auth.Application.Interfaces
{
    public interface IRpcClient
    {
        Task<TReply> RequestAsync<TReq, TReply>(
            string exchange,
            string routingKey,
            TReq message,
            TimeSpan timeout,
            CancellationToken ct = default);
    }
}
