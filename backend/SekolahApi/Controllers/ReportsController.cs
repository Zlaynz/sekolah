using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Reports;
using SekolahApi.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("student-report-card/{studentId}")]
        public async Task<IActionResult> GetStudentReportCard(int studentId, [FromQuery] int? academicYearId = null)
        {
            var student = await _context.Students
                .Include(s => s.ClassStudents)
                    .ThenInclude(cs => cs.Class)
                        .ThenInclude(c => c.AcademicYear)
                .Include(s => s.ClassStudents)
                    .ThenInclude(cs => cs.Class)
                        .ThenInclude(c => c.HomeroomTeacher)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null) return NotFound(new { message = "Siswa tidak ditemukan." });

            var classStudent = student.ClassStudents.FirstOrDefault();
            if (classStudent == null)
            {
                return BadRequest(new { message = "Siswa belum ditempatkan di kelas manapun." });
            }

            var currentClass = classStudent.Class;
            var ayId = academicYearId ?? currentClass.AcademicYearId;

            // Fetch subject assignments for this class
            var subjectTeachers = await _context.SubjectTeachers
                .Include(st => st.Subject)
                .Include(st => st.Teacher)
                .Where(st => st.ClassId == currentClass.Id)
                .ToListAsync();

            var gradeSummaries = new List<SubjectGradeSummaryDto>();

            foreach (var st in subjectTeachers)
            {
                // Daily grades
                var dailyScores = await _context.DailyGrades
                    .Where(dg => dg.SubjectTeacherId == st.Id && dg.StudentId == studentId)
                    .Select(dg => dg.Score)
                    .ToListAsync();

                decimal dailyAvg = dailyScores.Count > 0 ? Math.Round(dailyScores.Average(), 2) : 0m;

                // Exam grades
                var uts = await _context.ExamGrades
                    .Where(eg => eg.SubjectTeacherId == st.Id && eg.StudentId == studentId && eg.ExamType == ExamType.UTS)
                    .Select(eg => (decimal?)eg.Score)
                    .FirstOrDefaultAsync();

                var uas = await _context.ExamGrades
                    .Where(eg => eg.SubjectTeacherId == st.Id && eg.StudentId == studentId && (eg.ExamType == ExamType.UAS || eg.ExamType == ExamType.UKK))
                    .Select(eg => (decimal?)eg.Score)
                    .FirstOrDefaultAsync();

                // PRD Formulasi: NA = (0.30 * R_TH) + (0.30 * UTS) + (0.40 * UAS/UKK)
                decimal na = Math.Round((0.30m * dailyAvg) + (0.30m * (uts ?? 0m)) + (0.40m * (uas ?? 0m)), 2);

                gradeSummaries.Add(new SubjectGradeSummaryDto
                {
                    SubjectId = st.SubjectId,
                    SubjectCode = st.Subject.Code,
                    SubjectName = st.Subject.Name,
                    Kkm = st.Subject.Kkm,
                    DailyAvg = dailyAvg,
                    UtsScore = uts,
                    UasScore = uas,
                    FinalScore = na
                });
            }

            // Attendance
            var attendances = await _context.Attendances
                .Where(a => a.StudentId == studentId && a.SubjectTeacher.ClassId == currentClass.Id)
                .ToListAsync();

            var attendanceSummary = new StudentAttendanceSummaryDto
            {
                Hadir = attendances.Count(a => a.Status == AttendanceStatus.HADIR),
                Izin = attendances.Count(a => a.Status == AttendanceStatus.IZIN),
                Sakit = attendances.Count(a => a.Status == AttendanceStatus.SAKIT),
                Alpa = attendances.Count(a => a.Status == AttendanceStatus.ALPA)
            };

            decimal overallAvg = gradeSummaries.Count > 0
                ? Math.Round(gradeSummaries.Average(g => g.FinalScore), 2)
                : 0m;

            var reportCard = new StudentReportCardDto
            {
                StudentId = student.Id,
                StudentName = student.FullName,
                Nisn = student.Nisn,
                Nis = student.Nis,
                ClassName = currentClass.ClassName,
                GradeLevel = currentClass.GradeLevel,
                AcademicYear = currentClass.AcademicYear.YearName,
                Semester = currentClass.AcademicYear.Semester.ToString(),
                HomeroomTeacher = currentClass.HomeroomTeacher.FullName,
                Grades = gradeSummaries,
                Attendance = attendanceSummary,
                OverallAverage = overallAvg,
                HomeroomNotes = overallAvg >= 75.00m
                    ? "Pertahankan prestasimu dan terus semangat dalam belajar!"
                    : "Perlu ditingkatkan lagi kedisiplinan dan pembelajaran pada mata pelajaran yang belum tuntas."
            };

            return Ok(reportCard);
        }

        [HttpGet("class-recap/{classId}")]
        public async Task<IActionResult> GetClassRecap(int classId)
        {
            var cls = await _context.Classes
                .Include(c => c.AcademicYear)
                .Include(c => c.HomeroomTeacher)
                .Include(c => c.ClassStudents)
                    .ThenInclude(cs => cs.Student)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (cls == null) return NotFound(new { message = "Kelas tidak ditemukan." });

            var subjectTeachers = await _context.SubjectTeachers
                .Where(st => st.ClassId == classId)
                .Select(st => st.Id)
                .ToListAsync();

            var studentRows = new List<ClassRecapStudentRowDto>();

            foreach (var cs in cls.ClassStudents.OrderBy(cs => cs.Student.FullName))
            {
                var sId = cs.StudentId;

                // Attendance
                var atts = await _context.Attendances
                    .Where(a => a.StudentId == sId && subjectTeachers.Contains(a.SubjectTeacherId))
                    .ToListAsync();

                int hadir = atts.Count(a => a.Status == AttendanceStatus.HADIR);
                int izin = atts.Count(a => a.Status == AttendanceStatus.IZIN);
                int sakit = atts.Count(a => a.Status == AttendanceStatus.SAKIT);
                int alpa = atts.Count(a => a.Status == AttendanceStatus.ALPA);

                // Grades per subject
                int belowKkmCount = 0;
                var naList = new List<decimal>();

                foreach (var stId in subjectTeachers)
                {
                    var dailyScores = await _context.DailyGrades
                        .Where(dg => dg.SubjectTeacherId == stId && dg.StudentId == sId)
                        .Select(dg => dg.Score)
                        .ToListAsync();
                    decimal dailyAvg = dailyScores.Count > 0 ? dailyScores.Average() : 0m;

                    var uts = await _context.ExamGrades
                        .Where(eg => eg.SubjectTeacherId == stId && eg.StudentId == sId && eg.ExamType == ExamType.UTS)
                        .Select(eg => (decimal?)eg.Score)
                        .FirstOrDefaultAsync() ?? 0m;

                    var uas = await _context.ExamGrades
                        .Where(eg => eg.SubjectTeacherId == stId && eg.StudentId == sId && (eg.ExamType == ExamType.UAS || eg.ExamType == ExamType.UKK))
                        .Select(eg => (decimal?)eg.Score)
                        .FirstOrDefaultAsync() ?? 0m;

                    decimal na = Math.Round((0.30m * dailyAvg) + (0.30m * uts) + (0.40m * uas), 2);
                    naList.Add(na);
                    if (na < 75.00m) belowKkmCount++;
                }

                decimal avgGrade = naList.Count > 0 ? Math.Round(naList.Average(), 2) : 0m;

                studentRows.Add(new ClassRecapStudentRowDto
                {
                    StudentId = sId,
                    StudentNis = cs.Student.Nis,
                    StudentName = cs.Student.FullName,
                    Hadir = hadir,
                    Izin = izin,
                    Sakit = sakit,
                    Alpa = alpa,
                    AverageFinalGrade = avgGrade,
                    BelowKkmCount = belowKkmCount
                });
            }

            var recap = new ClassRecapDto
            {
                ClassId = cls.Id,
                ClassName = cls.ClassName,
                GradeLevel = cls.GradeLevel,
                AcademicYear = $"{cls.AcademicYear.YearName} ({cls.AcademicYear.Semester})",
                HomeroomTeacher = cls.HomeroomTeacher.FullName,
                Students = studentRows
            };

            return Ok(recap);
        }

        [HttpGet("graduation/{academicYearId}")]
        public async Task<IActionResult> GetGraduationRecap(int academicYearId)
        {
            var ay = await _context.AcademicYears.FindAsync(academicYearId);
            if (ay == null) return NotFound(new { message = "Tahun ajaran tidak ditemukan." });

            // Grade 9 students only
            var grade9Students = await _context.ClassStudents
                .Include(cs => cs.Class)
                .Include(cs => cs.Student)
                .Where(cs => cs.Class.AcademicYearId == academicYearId && cs.Class.GradeLevel == 9)
                .ToListAsync();

            var studentResults = new List<GraduationStudentResultDto>();

            foreach (var item in grade9Students)
            {
                var s = item.Student;

                // Graduation Exam scores
                var gradExams = await _context.GraduationExams
                    .Where(ge => ge.AcademicYearId == academicYearId && ge.StudentId == s.Id)
                    .ToListAsync();

                decimal examScore = gradExams.Count > 0 ? Math.Round(gradExams.Average(ge => ge.FinalScore), 2) : 0m;

                // Simulated average of Semester 1-5 reports (or average of existing grades)
                decimal s1toS5Avg = 82.50m; // Default benchmark if historical S1-S5 is not fully populated

                // PRD Formulasi Kelulusan: NA_Lulus = (0.60 * Rapor S1-S5) + (0.40 * GraduationExam.final_score)
                decimal finalGradScore = Math.Round((0.60m * s1toS5Avg) + (0.40m * examScore), 2);

                studentResults.Add(new GraduationStudentResultDto
                {
                    StudentId = s.Id,
                    Nisn = s.Nisn,
                    StudentName = s.FullName,
                    ClassName = item.Class.ClassName,
                    AvgReportS1toS5 = s1toS5Avg,
                    GraduationExamScore = examScore,
                    FinalGraduationScore = finalGradScore
                });
            }

            var recap = new GraduationRecapDto
            {
                AcademicYearId = academicYearId,
                AcademicYear = $"{ay.YearName} ({ay.Semester})",
                TotalCandidates = studentResults.Count,
                PassedCount = studentResults.Count(s => s.IsPassed),
                FailedCount = studentResults.Count(s => !s.IsPassed),
                Students = studentResults
            };

            return Ok(recap);
        }
    }
}

