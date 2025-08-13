namespace Users.Domain;

public class UserProfile
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public required int AuthUserId { get; set; }
    public DateTime BirthDate { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int UserId { get; set; }

}
