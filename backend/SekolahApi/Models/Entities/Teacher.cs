using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents a teacher/staff member linked to a user account.
    /// </summary>
    public class Teacher : BaseEntity
    {
        public int? UserId { get; set; }
        public string? Nip { get; set; }
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public TeacherPosition Position { get; set; } = TeacherPosition.GURU;
        public string? SignaturePath { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public ICollection<Class> HomeroomClasses { get; set; } = new List<Class>();
        public ICollection<SubjectTeacher> SubjectTeachers { get; set; } = new List<SubjectTeacher>();
    }
}
