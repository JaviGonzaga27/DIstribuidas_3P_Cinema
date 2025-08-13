
namespace Reviews.Application.Messaging.Events;

public class ReviewCreateRequested
{
    public int UserId { get; set; }
    public int MovieId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; }
}
