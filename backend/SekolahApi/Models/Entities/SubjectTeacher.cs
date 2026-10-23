namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Junction table linking subjects, teachers and classes.
    /// </summary>
    public class SubjectTeacher : BaseEntity
    {
        public int ClassId { get; set; }
        public int SubjectId { get; set; }
        public int TeacherId { get; set; }

        // Navigation properties
        public Class Class { get; set; } = null!;
        public Subject Subject { get; set; } = null!;
        public Teacher Teacher { get; set; } = null!;
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<DailyGrade> DailyGrades { get; set; } = new List<DailyGrade>();
        public ICollection<ExamGrade> ExamGrades { get; set; } = new List<ExamGrade>();
    }
}
