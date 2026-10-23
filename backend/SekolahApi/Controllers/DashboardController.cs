using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminStats()
        {
            var studentCount = await _context.Students.CountAsync();
            var teacherCount = await _context.Teachers.CountAsync();
            var classCount = await _context.Classes.CountAsync();
            var subjectCount = await _context.Subjects.CountAsync();

            var activeYear = await _context.AcademicYears
                .Where(a => a.IsActive)
                .Select(a => new { a.Id, a.YearName, a.Semester, a.IsLocked })
                .FirstOrDefaultAsync();

            var recentStudents = await _context.Students
                .OrderByDescending(s => s.CreatedAt)
                .Take(5)
                .Select(s => new { s.Id, s.FullName, s.Nisn, s.Nis, s.Status })
                .ToListAsync();

            return Ok(new
            {
                totalStudents = studentCount,
                totalTeachers = teacherCount,
                totalClasses = classCount,
                totalSubjects = subjectCount,
                activeAcademicYear = activeYear,
                recentStudents
            });
        }

        [HttpGet("teacher")]
        public async Task<IActionResult> GetTeacherStats([FromQuery] int? teacherId = null)
        {
            int tId = teacherId ?? 0;
            if (tId == 0)
            {
                var teacherClaim = User.FindFirst("TeacherId")?.Value;
                if (!string.IsNullOrEmpty(teacherClaim)) int.TryParse(teacherClaim, out tId);
            }

            var assignments = await _context.SubjectTeachers
                .Include(st => st.Class)
                .Include(st => st.Subject)
                .Where(st => tId == 0 || st.TeacherId == tId)
                .Select(st => new
                {
                    st.Id,
                    ClassName = st.Class.ClassName,
                    GradeLevel = st.Class.GradeLevel,
                    SubjectName = st.Subject.Name,
                    st.Subject.Kkm
                })
                .ToListAsync();

            var homeroom = await _context.Classes
                .Include(c => c.ClassStudents)
                .Where(c => tId != 0 && c.HomeroomTeacherId == tId)
                .Select(c => new
                {
                    c.Id,
                    c.ClassName,
                    c.GradeLevel,
                    StudentCount = c.ClassStudents.Count()
                })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                teacherId = tId,
                totalClassesTaught = assignments.Count,
                homeroomClass = homeroom,
                teachingAssignments = assignments
            });
        }

        [HttpGet("principal")]
        public async Task<IActionResult> GetPrincipalStats()
        {
            var totalStudents = await _context.Students.CountAsync();
            var totalTeachers = await _context.Teachers.CountAsync();
            var totalClasses = await _context.Classes.CountAsync();

            var grade9Count = await _context.Classes
                .Where(c => c.GradeLevel == 9)
                .SelectMany(c => c.ClassStudents)
                .CountAsync();

            var gradExamsPassed = await _context.GraduationExams
                .Where(ge => ge.FinalScore >= 75.00m)
                .Select(ge => ge.StudentId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                totalStudents,
                totalTeachers,
                totalClasses,
                grade9Candidates = grade9Count,
                graduatedCount = gradExamsPassed,
                kkmStandard = 75.00
            });
        }
    }
}

