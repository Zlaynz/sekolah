using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Helpers
{
    public static class FileUploadHelper
    {
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

        public static async Task<(bool Success, string? FilePath, string? ErrorMessage)> SavePhotoAsync(
            IFormFile? file,
            IWebHostEnvironment environment,
            string subFolder = "photos")
        {
            if (file == null || file.Length == 0)
            {
                return (false, null, "File gambar tidak ditemukan atau kosong.");
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return (false, null, "Ukuran file melebihi batas maksimal 5 MB.");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return (false, null, "Format file tidak didukung. Harap gunakan format JPG, PNG, WEBP, atau GIF.");
            }

            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return (false, null, "MIME type file tidak valid untuk format gambar.");
            }

            // Verify file signature (magic bytes) to prevent disguised malicious files
            using var stream = file.OpenReadStream();
            var header = new byte[8];
            int read = await stream.ReadAsync(header.AsMemory(0, header.Length));
            if (!IsValidImageHeader(header, extension))
            {
                return (false, null, "Isi file tidak sesuai dengan format gambar yang valid.");
            }
            stream.Position = 0;

            var uploadsRoot = Path.Combine(environment.ContentRootPath, "uploads", subFolder);
            if (!Directory.Exists(uploadsRoot))
            {
                Directory.CreateDirectory(uploadsRoot);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(uploadsRoot, uniqueFileName);

            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var relativePath = $"/uploads/{subFolder}/{uniqueFileName}";
            return (true, relativePath, null);
        }

        public static void DeleteFile(string? relativePath, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return;

            try
            {
                var cleanPath = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var fullPath = Path.Combine(environment.ContentRootPath, cleanPath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch
            {
                // Ignore file deletion errors to avoid breaking API flows
            }
        }

        private static bool IsValidImageHeader(byte[] header, string extension)
        {
            if (header.Length < 4) return false;

            return extension switch
            {
                ".jpg" or ".jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
                ".png" => header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47,
                ".gif" => header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46,
                ".webp" => header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46,
                _ => false
            };
        }
    }
}

