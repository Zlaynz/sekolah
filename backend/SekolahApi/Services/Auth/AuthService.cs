using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Auth;
using SekolahApi.Models.Entities;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SekolahApi.Services.Auth
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request);
        Task<CurrentUserDto?> GetCurrentUserAsync(int userId);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Teacher)
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return null;
            }

            // Verify password using BCrypt
            bool validPassword = false;
            try
            {
                validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            }
            catch
            {
                // Fallback for plain text during testing or first seed
                validPassword = user.Password == request.Password;
            }

            if (!validPassword)
            {
                return null;
            }

            string displayName = user.Username;
            int? teacherId = user.Teacher?.Id;
            int? studentId = user.Student?.Id;
            int? classId = null;

            if (user.Teacher != null)
            {
                displayName = user.Teacher.FullName;
                var homeroomClass = await _context.Classes.FirstOrDefaultAsync(c => c.HomeroomTeacherId == user.Teacher.Id);
                classId = homeroomClass?.Id;
            }
            else if (user.Student != null)
            {
                displayName = user.Student.FullName;
                var classStudent = await _context.ClassStudents.FirstOrDefaultAsync(cs => cs.StudentId == user.Student.Id);
                classId = classStudent?.ClassId;
            }

            var token = GenerateJwtToken(user, displayName, teacherId, studentId);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role.ToString(),
                DisplayName = displayName,
                TeacherId = teacherId,
                StudentId = studentId,
                ClassId = classId
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            bool validOld = false;
            try
            {
                validOld = BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password);
            }
            catch
            {
                validOld = user.Password == request.OldPassword;
            }

            if (!validOld) return false;

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CurrentUserDto?> GetCurrentUserAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Teacher)
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            return new CurrentUserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                DisplayName = user.Teacher?.FullName ?? user.Student?.FullName ?? user.Username,
                TeacherId = user.Teacher?.Id,
                StudentId = user.Student?.Id
            };
        }

        private string GenerateJwtToken(User user, string displayName, int? teacherId, int? studentId)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var keyString = jwtSettings["Key"] ?? "SekolahSuperSecretKeyForJwtAuthenticationSMP2026!@#$%^&*";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("DisplayName", displayName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("TeacherId", teacherId?.ToString() ?? ""),
                new Claim("StudentId", studentId?.ToString() ?? "")
            };

            var expiryMinutes = int.TryParse(jwtSettings["ExpiryMinutes"], out var mins) ? mins : 1440;

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "SekolahApi",
                audience: jwtSettings["Audience"] ?? "SekolahApp",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

