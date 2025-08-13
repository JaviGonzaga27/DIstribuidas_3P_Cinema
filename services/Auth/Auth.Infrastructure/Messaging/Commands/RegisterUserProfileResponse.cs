namespace Auth.Infrastructure.Messaging.Commands
{
    public class RegisterUserProfileResponse
    {
        public bool Success { get; set; }
        public string? Reason { get; set; }
    }
}
