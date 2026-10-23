namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents a school subject/course.
    /// </summary>
    public class Subject : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Kkm { get; set; } = 75.00m;

        // Navigation properties
        public ICollection<SubjectTeacher> SubjectTeachers { get; set; } = new List<SubjectTeacher>();
        public ICollection<GraduationExam> GraduationExams { get; set; } = new List<GraduationExam>();
    }
}
