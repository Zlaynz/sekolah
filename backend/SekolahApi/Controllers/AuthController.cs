using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.Auth;
using SekolahApi.Services.Auth;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AuthController(IAuthService authService, AppDbContext context, IWebHostEnvironment env)
        {
            _authService = authService;
            _context = context;
            _env = env;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "Username atau password salah." });
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var success = await _authService.ChangePasswordAsync(userId, request);
            if (!success)
            {
                return BadRequest(new { message = "Password lama tidak sesuai." });
            }

            return Ok(new { message = "Password berhasil diubah." });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetCurrentUserAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [Authorize]
        [HttpPost("profile-photo")]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Akun tidak ditemukan." });

            var (success, filePath, errorMessage) = await FileUploadHelper.SavePhotoAsync(file, _env, "photos");
            if (!success)
            {
                return BadRequest(new { message = errorMessage });
            }

            // Delete old photo if it exists
            FileUploadHelper.DeleteFile(user.PhotoPath, _env);

            user.PhotoPath = filePath;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Foto profil berhasil diperbarui.",
                photoPath = filePath
            });
        }

        [Authorize]
        [HttpDelete("profile-photo")]
        public async Task<IActionResult> DeleteProfilePhoto()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Akun tidak ditemukan." });

            if (!string.IsNullOrEmpty(user.PhotoPath))
            {
                FileUploadHelper.DeleteFile(user.PhotoPath, _env);
                user.PhotoPath = null;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Foto profil berhasil dihapus." });
        }
    }
}
