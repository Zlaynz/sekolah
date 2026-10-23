using SekolahApi.Models.Enums;

namespace SekolahApi.Models.Entities
{
    /// <summary>
    /// Records student attendance for a specific subject session.
    /// </summary>
    public class Attendance : BaseEntity
    {
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public DateTime Date { get; set; }
        public AttendanceStatus Status { get; set; }
        public string? Notes { get; set; }

        // Navigation properties
        public SubjectTeacher SubjectTeacher { get; set; } = null!;
        public Student Student { get; set; } = null!;
    }
}
