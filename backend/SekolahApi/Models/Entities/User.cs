using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents an authenticated user in the system.
    /// </summary>
    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? PhotoPath { get; set; }

        // Navigation properties
        public Teacher? Teacher { get; set; }
        public Student? Student { get; set; }
    }
}
