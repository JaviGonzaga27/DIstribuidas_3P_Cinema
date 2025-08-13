namespace Auth.Application.DTOs
{
    public class RegisterUserDto
    {
        public int Id { get; set; } // Para comunicación RPC con Users
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Role { get; set; } = "Client"; // Cambiar default a Client
        public required string Name { get; set; }
        public required string FullName { get; set; }
        public required DateTime BirthDate { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Address { get; set; }
    }
}
