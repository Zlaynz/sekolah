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
    [Route("api/attendances")]
    [Authorize]
    public class AttendancesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendancesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBySubjectTeacher(
            [FromQuery] int subjectTeacherId,
            [FromQuery] DateTime? date = null)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var attendances = await _context.Attendances
                .Include(a => a.Student)
                .AsNoTracking()
                .Where(a => a.SubjectTeacherId == subjectTeacherId && a.Date.Date == targetDate)
                .OrderBy(a => a.Student.FullName)
                .Select(a => new AttendanceDto
                {
                    Id = a.Id,
                    SubjectTeacherId = a.SubjectTeacherId,
                    StudentId = a.StudentId,
                    StudentName = a.Student.FullName,
                    StudentNis = a.Student.Nis,
                    Date = a.Date,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return Ok(attendances);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "ADMIN,GURU,WALIKELAS")]
        public async Task<IActionResult> BulkSave([FromBody] BulkSaveAttendanceDto dto)
        {
            // Check Academic Year Lock Status
            var st = await _context.SubjectTeachers
                .Include(s => s.Class)
                    .ThenInclude(c => c.AcademicYear)
                .FirstOrDefaultAsync(s => s.Id == dto.SubjectTeacherId);

            if (st == null) return NotFound(new { message = "Data pengampu tidak ditemukan." });

            if (st.Class.AcademicYear.IsLocked)
            {
                return BadRequest(new { message = "Periode penginputan telah dikunci (Locking Period Aktif). Presensi tidak dapat diubah." });
            }

            var targetDate = dto.Date.Date;

            foreach (var item in dto.Items)
            {
                var existing = await _context.Attendances
                    .FirstOrDefaultAsync(a => a.SubjectTeacherId == dto.SubjectTeacherId &&
                                              a.StudentId == item.StudentId &&
                                              a.Date.Date == targetDate);

                if (existing != null)
                {
                    existing.Status = item.Status;
                    existing.Notes = item.Notes;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.Attendances.Add(new Attendance
                    {
                        SubjectTeacherId = dto.SubjectTeacherId,
                        StudentId = item.StudentId,
                        Date = targetDate,
                        Status = item.Status,
                        Notes = item.Notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Data presensi berhasil disimpan." });
        }
    }
}

