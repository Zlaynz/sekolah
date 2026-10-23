namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents a class/section within an academic year.
    /// </summary>
    public class Class : BaseEntity
    {
        public int AcademicYearId { get; set; }
        public int HomeroomTeacherId { get; set; }
        public int GradeLevel { get; set; }
        public string ClassName { get; set; } = string.Empty;

        // Navigation properties
        public AcademicYear AcademicYear { get; set; } = null!;
        public Teacher HomeroomTeacher { get; set; } = null!;
        public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
        public ICollection<SubjectTeacher> SubjectTeachers { get; set; } = new List<SubjectTeacher>();
    }
}
