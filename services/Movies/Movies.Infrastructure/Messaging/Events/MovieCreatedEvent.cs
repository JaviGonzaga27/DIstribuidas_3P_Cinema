
namespace Movies.Infrastructure.Messaging.Events
{
    public record MovieCreatedEvent(
       int MovieId,
       string Title,
       int TotalSeats,
       decimal Price,
       string Language,
       string Format
   );
}
