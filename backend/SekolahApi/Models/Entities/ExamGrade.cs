using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Records exam grades (UTS/UAS/UKK) for a student in a subject.
    /// </summary>
    public class ExamGrade : BaseEntity
    {
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public ExamType ExamType { get; set; }
        public decimal Score { get; set; }

        // Navigation properties
        public SubjectTeacher SubjectTeacher { get; set; } = null!;
        public Student Student { get; set; } = null!;
    }
}
