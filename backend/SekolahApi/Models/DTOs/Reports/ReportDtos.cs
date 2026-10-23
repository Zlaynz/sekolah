using System.Collections.Generic;

namespace SekolahApi.Models.DTOs.Reports
{
    public class SubjectGradeSummaryDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal Kkm { get; set; } = 75.00m;
        public decimal DailyAvg { get; set; } // R_TH
        public decimal? UtsScore { get; set; }
        public decimal? UasScore { get; set; } // UAS or UKK
        public decimal FinalScore { get; set; } // NA = 0.30*R_TH + 0.30*UTS + 0.40*UAS
        public string Status => FinalScore >= 75.00m ? "Tuntas" : "Belum Tuntas";
        public bool IsBelowKkm => FinalScore < 75.00m;
    }

    public class StudentAttendanceSummaryDto
    {
        public int Hadir { get; set; }
        public int Izin { get; set; }
        public int Sakit { get; set; }
        public int Alpa { get; set; }
        public int Total => Hadir + Izin + Sakit + Alpa;
        public double Percentage => Total > 0 ? (double)Hadir / Total * 100 : 100;
    }

    public class StudentReportCardDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Nisn { get; set; } = string.Empty;
        public string Nis { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int GradeLevel { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string HomeroomTeacher { get; set; } = string.Empty;
        public List<SubjectGradeSummaryDto> Grades { get; set; } = new();
        public StudentAttendanceSummaryDto Attendance { get; set; } = new();
        public decimal OverallAverage { get; set; }
        public string HomeroomNotes { get; set; } = string.Empty;
    }

    public class ClassRecapStudentRowDto
    {
        public int StudentId { get; set; }
        public string StudentNis { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public int Hadir { get; set; }
        public int Izin { get; set; }
        public int Sakit { get; set; }
        public int Alpa { get; set; }
        public decimal AverageFinalGrade { get; set; }
        public int BelowKkmCount { get; set; }
        public string Status => BelowKkmCount == 0 ? "Tuntas" : $"{BelowKkmCount} Mapel Remedi";
    }

    public class ClassRecapDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int GradeLevel { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public string HomeroomTeacher { get; set; } = string.Empty;
        public List<ClassRecapStudentRowDto> Students { get; set; } = new();
    }

    public class GraduationStudentResultDto
    {
        public int StudentId { get; set; }
        public string Nisn { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public decimal AvgReportS1toS5 { get; set; }
        public decimal GraduationExamScore { get; set; }
        public decimal FinalGraduationScore { get; set; } // 0.60 * S1-S5 + 0.40 * Exam
        public string Status => FinalGraduationScore >= 75.00m ? "LULUS" : "TIDAK LULUS";
        public bool IsPassed => FinalGraduationScore >= 75.00m;
    }

    public class GraduationRecapDto
    {
        public int AcademicYearId { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public int TotalCandidates { get; set; }
        public int PassedCount { get; set; }
        public int FailedCount { get; set; }
        public List<GraduationStudentResultDto> Students { get; set; } = new();
    }
}

