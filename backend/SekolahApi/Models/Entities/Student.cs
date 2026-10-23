using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Represents a student linked to a user account.
    /// </summary>
    public class Student : BaseEntity
    {
        public int? UserId { get; set; }
        public string Nisn { get; set; } = string.Empty;
        public string Nis { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public string BirthPlace { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public StudentStatus Status { get; set; } = StudentStatus.AKTIF;

        // Navigation properties
        public User? User { get; set; }
        public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<DailyGrade> DailyGrades { get; set; } = new List<DailyGrade>();
        public ICollection<ExamGrade> ExamGrades { get; set; } = new List<ExamGrade>();
        public ICollection<GraduationExam> GraduationExams { get; set; } = new List<GraduationExam>();
    }
}
