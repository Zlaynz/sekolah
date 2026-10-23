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
    [Route("api/daily-grades")]
    [Authorize]
    public class DailyGradesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DailyGradesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBySubjectTeacher(
            [FromQuery] int subjectTeacherId,
            [FromQuery] string? taskTitle = null)
        {
            var query = _context.DailyGrades
                .Include(dg => dg.Student)
                .AsNoTracking()
                .Where(dg => dg.SubjectTeacherId == subjectTeacherId);

            if (!string.IsNullOrWhiteSpace(taskTitle))
            {
                query = query.Where(dg => dg.TaskTitle == taskTitle);
            }

            var items = await query
                .OrderBy(dg => dg.CreatedAt)
                .ThenBy(dg => dg.Student.FullName)
                .Select(dg => new DailyGradeDto
                {
                    Id = dg.Id,
                    SubjectTeacherId = dg.SubjectTeacherId,
                    StudentId = dg.StudentId,
                    StudentName = dg.Student.FullName,
                    StudentNis = dg.Student.Nis,
                    TaskTitle = dg.TaskTitle,
                    Score = dg.Score,
                    CreatedAt = dg.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetDistinctTasks([FromQuery] int subjectTeacherId)
        {
            var tasks = await _context.DailyGrades
                .AsNoTracking()
                .Where(dg => dg.SubjectTeacherId == subjectTeacherId)
                .Select(dg => dg.TaskTitle)
                .Distinct()
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "ADMIN,GURU")]
        public async Task<IActionResult> BulkSave([FromBody] BulkSaveDailyGradeDto dto)
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

            if (string.IsNullOrWhiteSpace(dto.TaskTitle))
            {
                return BadRequest(new { message = "Judul tugas/kuis tidak boleh kosong." });
            }

            foreach (var item in dto.Items)
            {
                if (item.Score < 0 || item.Score > 100)
                {
                    return BadRequest(new { message = $"Nilai harus berada di rentang 0-100." });
                }

                var existing = await _context.DailyGrades
                    .FirstOrDefaultAsync(dg => dg.SubjectTeacherId == dto.SubjectTeacherId &&
                                               dg.StudentId == item.StudentId &&
                                               dg.TaskTitle == dto.TaskTitle);

                if (existing != null)
                {
                    existing.Score = item.Score;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.DailyGrades.Add(new DailyGrade
                    {
                        SubjectTeacherId = dto.SubjectTeacherId,
                        StudentId = item.StudentId,
                        TaskTitle = dto.TaskTitle,
                        Score = item.Score,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Nilai harian berhasil disimpan." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN,GURU")]
        public async Task<IActionResult> Delete(int id)
        {
            var grade = await _context.DailyGrades
                .Include(g => g.SubjectTeacher)
                    .ThenInclude(st => st.Class)
                        .ThenInclude(c => c.AcademicYear)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grade == null) return NotFound();

            if (grade.SubjectTeacher.Class.AcademicYear.IsLocked)
            {
                return BadRequest(new { message = "Periode penilaian telah dikunci. Data tidak dapat dihapus." });
            }

            grade.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nilai harian berhasil dihapus." });
        }
    }
}

