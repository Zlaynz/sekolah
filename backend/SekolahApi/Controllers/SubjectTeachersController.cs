using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Classes;
using SekolahApi.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/subject-teachers")]
    [Authorize]
    public class SubjectTeachersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectTeachersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? classId = null,
            [FromQuery] int? teacherId = null)
        {
            var query = _context.SubjectTeachers
                .Include(st => st.Class)
                .Include(st => st.Subject)
                .Include(st => st.Teacher)
                .AsNoTracking();

            if (classId.HasValue) query = query.Where(st => st.ClassId == classId.Value);
            if (teacherId.HasValue) query = query.Where(st => st.TeacherId == teacherId.Value);

            var items = await query
                .OrderBy(st => st.Class.ClassName)
                .ThenBy(st => st.Subject.Name)
                .Select(st => new SubjectTeacherDto
                {
                    Id = st.Id,
                    ClassId = st.ClassId,
                    ClassName = st.Class.ClassName,
                    GradeLevel = st.Class.GradeLevel,
                    SubjectId = st.SubjectId,
                    SubjectCode = st.Subject.Code,
                    SubjectName = st.Subject.Name,
                    SubjectKkm = st.Subject.Kkm,
                    TeacherId = st.TeacherId,
                    TeacherName = st.Teacher.FullName
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var st = await _context.SubjectTeachers
                .Include(x => x.Class)
                .Include(x => x.Subject)
                .Include(x => x.Teacher)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (st == null) return NotFound();

            return Ok(new SubjectTeacherDto
            {
                Id = st.Id,
                ClassId = st.ClassId,
                ClassName = st.Class.ClassName,
                GradeLevel = st.Class.GradeLevel,
                SubjectId = st.SubjectId,
                SubjectCode = st.Subject.Code,
                SubjectName = st.Subject.Name,
                SubjectKkm = st.Subject.Kkm,
                TeacherId = st.TeacherId,
                TeacherName = st.Teacher.FullName
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Assign([FromBody] AssignSubjectTeacherDto dto)
        {
            var exists = await _context.SubjectTeachers.AnyAsync(st =>
                st.ClassId == dto.ClassId && st.SubjectId == dto.SubjectId);

            if (exists) return BadRequest(new { message = "Mata pelajaran ini sudah memiliki guru pengampu di kelas ini." });

            var entity = new SubjectTeacher
            {
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                TeacherId = dto.TeacherId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SubjectTeachers.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.SubjectTeachers.FindAsync(id);
            if (entity == null) return NotFound();

            // Check if there are active attendances or grades
            var hasAttendances = await _context.Attendances.AnyAsync(a => a.SubjectTeacherId == id);
            var hasGrades = await _context.DailyGrades.AnyAsync(dg => dg.SubjectTeacherId == id) ||
                            await _context.ExamGrades.AnyAsync(eg => eg.SubjectTeacherId == id);

            if (hasAttendances || hasGrades)
            {
                throw new ReferentialConstraintException(
                    "Penugasan pengampu tidak dapat dihapus karena memiliki riwayat presensi atau nilai aktif.",
                    "subject_teachers",
                    hasAttendances ? "attendances" : "grades"
                );
            }

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Penugasan guru pengampu berhasil dihapus." });
        }
    }
}

