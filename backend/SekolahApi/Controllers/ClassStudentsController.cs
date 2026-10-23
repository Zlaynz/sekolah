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
    [Route("api/class-students")]
    [Authorize]
    public class ClassStudentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClassStudentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetByClass([FromQuery] int classId)
        {
            var students = await _context.ClassStudents
                .Include(cs => cs.Student)
                .AsNoTracking()
                .Where(cs => cs.ClassId == classId)
                .OrderBy(cs => cs.Student.FullName)
                .Select(cs => new ClassStudentDto
                {
                    Id = cs.Id,
                    ClassId = cs.ClassId,
                    StudentId = cs.StudentId,
                    StudentNisn = cs.Student.Nisn,
                    StudentNis = cs.Student.Nis,
                    StudentName = cs.Student.FullName,
                    Gender = cs.Student.Gender.ToString()
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> AssignStudent([FromBody] AssignStudentDto dto)
        {
            var exists = await _context.ClassStudents.AnyAsync(cs =>
                cs.ClassId == dto.ClassId && cs.StudentId == dto.StudentId);

            if (exists) return BadRequest(new { message = "Siswa sudah terdaftar di kelas ini." });

            var entity = new ClassStudent
            {
                ClassId = dto.ClassId,
                StudentId = dto.StudentId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ClassStudents.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Remove(int id)
        {
            var cs = await _context.ClassStudents.FindAsync(id);
            if (cs == null) return NotFound();

            cs.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Siswa berhasil dikeluarkan dari kelas." });
        }
    }
}

