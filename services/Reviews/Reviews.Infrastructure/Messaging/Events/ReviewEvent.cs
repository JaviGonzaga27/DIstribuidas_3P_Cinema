namespace Messaging.Events;

public record ReviewCreateRequested(int UserId, int MovieId, string Comment, int Rating);
public record ReviewMovieValidated(int MovieId, bool IsValid);
public record ReviewUserValidated(int UserId, bool IsValid);
