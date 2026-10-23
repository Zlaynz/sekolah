using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Grades;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/exam-grades")]
    [Authorize]
    public class ExamGradesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExamGradesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBySubjectTeacher(
            [FromQuery] int subjectTeacherId,
            [FromQuery] ExamType? examType = null)
        {
            var query = _context.ExamGrades
                .Include(eg => eg.Student)
                .AsNoTracking()
                .Where(eg => eg.SubjectTeacherId == subjectTeacherId);

            if (examType.HasValue)
            {
                query = query.Where(eg => eg.ExamType == examType.Value);
            }

            var items = await query
                .OrderBy(eg => eg.ExamType)
                .ThenBy(eg => eg.Student.FullName)
                .Select(eg => new ExamGradeDto
                {
                    Id = eg.Id,
                    SubjectTeacherId = eg.SubjectTeacherId,
                    StudentId = eg.StudentId,
                    StudentName = eg.Student.FullName,
                    StudentNis = eg.Student.Nis,
                    ExamType = eg.ExamType,
                    Score = eg.Score,
                    CreatedAt = eg.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "ADMIN,GURU")]
        public async Task<IActionResult> BulkSave([FromBody] BulkSaveExamGradeDto dto)
        {
            // Check locking status
            var st = await _context.SubjectTeachers
                .Include(s => s.Class)
                    .ThenInclude(c => c.AcademicYear)
                .FirstOrDefaultAsync(s => s.Id == dto.SubjectTeacherId);

            if (st == null) return NotFound(new { message = "Data pengampu tidak ditemukan." });

            if (st.Class.AcademicYear.IsLocked)
            {
                return BadRequest(new { message = "Periode penilaian telah dikunci (Locking Period Aktif). Nilai tidak dapat diubah." });
            }

            // PRD Rule: "UKK hanya diinput pada semester GENAP untuk kelas 7 dan 8."
            if (dto.ExamType == ExamType.UKK)
            {
                if (st.Class.AcademicYear.Semester != Semester.GENAP)
                {
                    return BadRequest(new { message = "Penilaian UKK hanya dapat diinput pada semester GENAP." });
                }
                if (st.Class.GradeLevel != 7 && st.Class.GradeLevel != 8)
                {
                    return BadRequest(new { message = "Penilaian UKK hanya berlaku untuk kelas 7 dan 8." });
                }
            }

            foreach (var item in dto.Items)
            {
                if (item.Score < 0 || item.Score > 100)
                {
                    return BadRequest(new { message = "Nilai harus berada di rentang 0-100." });
                }

                var existing = await _context.ExamGrades
                    .FirstOrDefaultAsync(eg => eg.SubjectTeacherId == dto.SubjectTeacherId &&
                                               eg.StudentId == item.StudentId &&
                                               eg.ExamType == dto.ExamType);

                if (existing != null)
                {
                    existing.Score = item.Score;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.ExamGrades.Add(new ExamGrade
                    {
                        SubjectTeacherId = dto.SubjectTeacherId,
                        StudentId = item.StudentId,
                        ExamType = dto.ExamType,
                        Score = item.Score,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Nilai {dto.ExamType} berhasil disimpan." });
        }
    }
}

