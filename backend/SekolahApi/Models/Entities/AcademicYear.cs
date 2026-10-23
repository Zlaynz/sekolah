using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents an academic year with semester designation.
    /// </summary>
    public class AcademicYear : BaseEntity
    {
        public string YearName { get; set; } = string.Empty;
        public Semester Semester { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }

        // Navigation properties
        public ICollection<Class> Classes { get; set; } = new List<Class>();
        public ICollection<GraduationExam> GraduationExams { get; set; } = new List<GraduationExam>();
    }
}
