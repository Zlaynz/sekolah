using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Grades;
using SekolahApi.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/graduation-exams")]
    [Authorize]
    public class GraduationExamsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GraduationExamsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? academicYearId = null,
            [FromQuery] int? subjectId = null,
            [FromQuery] int? studentId = null)
        {
            var query = _context.GraduationExams
                .Include(ge => ge.Student)
                    .ThenInclude(s => s.ClassStudents)
                        .ThenInclude(cs => cs.Class)
                .Include(ge => ge.Subject)
                .AsNoTracking();

            if (academicYearId.HasValue) query = query.Where(ge => ge.AcademicYearId == academicYearId.Value);
            if (subjectId.HasValue) query = query.Where(ge => ge.SubjectId == subjectId.Value);
            if (studentId.HasValue) query = query.Where(ge => ge.StudentId == studentId.Value);

            var items = await query
                .OrderBy(ge => ge.Student.FullName)
                .Select(ge => new GraduationExamDto
                {
                    Id = ge.Id,
                    AcademicYearId = ge.AcademicYearId,
                    StudentId = ge.StudentId,
                    StudentName = ge.Student.FullName,
                    StudentNisn = ge.Student.Nisn,
                    ClassName = ge.Student.ClassStudents.Select(cs => cs.Class.ClassName).FirstOrDefault() ?? "-",
                    SubjectId = ge.SubjectId,
                    SubjectName = ge.Subject.Name,
                    WrittenScore = ge.WrittenScore,
                    PracticalScore = ge.PracticalScore,
                    FinalScore = ge.FinalScore
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN,GURU")]
        public async Task<IActionResult> Save([FromBody] SaveGraduationExamDto dto)
        {
            // PRD Rule Check: Must reject for non-grade 9 students
            var classStudent = await _context.ClassStudents
                .Include(cs => cs.Class)
                .FirstOrDefaultAsync(cs => cs.StudentId == dto.StudentId && cs.Class.AcademicYearId == dto.AcademicYearId);

            if (classStudent == null)
            {
                // Fallback check: find latest class of student
                classStudent = await _context.ClassStudents
                    .Include(cs => cs.Class)
                    .FirstOrDefaultAsync(cs => cs.StudentId == dto.StudentId);
            }

            if (classStudent == null || classStudent.Class.GradeLevel != 9)
            {
                return BadRequest(new
                {
                    message = "Restriksi Pelanggaran PRD: Modul Ujian Kelulusan hanya diperbolehkan untuk siswa tingkat Kelas 9."
                });
            }

            // Check Academic Year locking
            var ay = await _context.AcademicYears.FindAsync(dto.AcademicYearId);
            if (ay != null && ay.IsLocked)
            {
                return BadRequest(new { message = "Periode penilaian telah dikunci (Locking Period Aktif)." });
            }

            if (dto.WrittenScore < 0 || dto.WrittenScore > 100 || dto.PracticalScore < 0 || dto.PracticalScore > 100)
            {
                return BadRequest(new { message = "Nilai harus berada di rentang 0-100." });
            }

            decimal finalScore = Math.Round((dto.WrittenScore + dto.PracticalScore) / 2.0m, 2);

            var existing = await _context.GraduationExams
                .FirstOrDefaultAsync(ge => ge.AcademicYearId == dto.AcademicYearId &&
                                           ge.StudentId == dto.StudentId &&
                                           ge.SubjectId == dto.SubjectId);

            if (existing != null)
            {
                existing.WrittenScore = dto.WrittenScore;
                existing.PracticalScore = dto.PracticalScore;
                existing.FinalScore = finalScore;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                existing = new GraduationExam
                {
                    AcademicYearId = dto.AcademicYearId,
                    StudentId = dto.StudentId,
                    SubjectId = dto.SubjectId,
                    WrittenScore = dto.WrittenScore,
                    PracticalScore = dto.PracticalScore,
                    FinalScore = finalScore,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.GraduationExams.Add(existing);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Nilai ujian kelulusan berhasil disimpan.", finalScore = existing.FinalScore });
        }
    }
}

