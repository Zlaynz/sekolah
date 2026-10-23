namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Records graduation exam scores for grade 9 students.
    /// </summary>
    public class GraduationExam : BaseEntity
    {
        public int AcademicYearId { get; set; }
        public int StudentId { get; set; }
        public int SubjectId { get; set; }
        public decimal WrittenScore { get; set; }
        public decimal PracticalScore { get; set; }
        public decimal FinalScore { get; set; }

        // Navigation properties
        public AcademicYear AcademicYear { get; set; } = null!;
        public Student Student { get; set; } = null!;
        public Subject Subject { get; set; } = null!;
    }
}
