namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Records daily task/assignment grades for a student in a subject.
    /// </summary>
    public class DailyGrade : BaseEntity
    {
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public decimal Score { get; set; }

        // Navigation properties
        public SubjectTeacher SubjectTeacher { get; set; } = null!;
        public Student Student { get; set; } = null!;
    }
}
