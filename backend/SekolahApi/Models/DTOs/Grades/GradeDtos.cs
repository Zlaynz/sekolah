using SekolahApi.Models.Enums;
using System;
using System.Collections.Generic;

namespace SekolahApi.Models.DTOs.Grades
{
    // Attendances
    public class AttendanceDto
    {
        public int Id { get; set; }
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentNis { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public AttendanceStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    public class SaveAttendanceItemDto
    {
        public int StudentId { get; set; }
        public AttendanceStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    public class BulkSaveAttendanceDto
    {
        public int SubjectTeacherId { get; set; }
        public DateTime Date { get; set; }
        public List<SaveAttendanceItemDto> Items { get; set; } = new();
    }

    // Daily Grades
    public class DailyGradeDto
    {
        public int Id { get; set; }
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentNis { get; set; } = string.Empty;
        public string TaskTitle { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public bool IsBelowKkm => Score < 75.00m;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDailyGradeDto
    {
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public decimal Score { get; set; }
    }

    public class BulkDailyGradeItemDto
    {
        public int StudentId { get; set; }
        public decimal Score { get; set; }
    }

    public class BulkSaveDailyGradeDto
    {
        public int SubjectTeacherId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public List<BulkDailyGradeItemDto> Items { get; set; } = new();
    }

    // Exam Grades
    public class ExamGradeDto
    {
        public int Id { get; set; }
        public int SubjectTeacherId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentNis { get; set; } = string.Empty;
        public ExamType ExamType { get; set; }
        public decimal Score { get; set; }
        public bool IsBelowKkm => Score < 75.00m;
        public DateTime CreatedAt { get; set; }
    }

    public class BulkSaveExamGradeItemDto
    {
        public int StudentId { get; set; }
        public decimal Score { get; set; }
    }

    public class BulkSaveExamGradeDto
    {
        public int SubjectTeacherId { get; set; }
        public ExamType ExamType { get; set; }
        public List<BulkSaveExamGradeItemDto> Items { get; set; } = new();
    }

    // Graduation Exams (Class 9 only)
    public class GraduationExamDto
    {
        public int Id { get; set; }
        public int AcademicYearId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentNisn { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public decimal WrittenScore { get; set; }
        public decimal PracticalScore { get; set; }
        public decimal FinalScore { get; set; }
        public bool IsBelowKkm => FinalScore < 75.00m;
    }

    public class SaveGraduationExamDto
    {
        public int AcademicYearId { get; set; }
        public int StudentId { get; set; }
        public int SubjectId { get; set; }
        public decimal WrittenScore { get; set; }
        public decimal PracticalScore { get; set; }
    }
}

