using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Models.DTOs.Search;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Services.Search
{
    public interface ISearchEngineService
    {
        Task<SearchEngineResponseDto> SearchAsync(string query, string? entityType = null, int limit = 20);
    }

    public class SearchEngineService : ISearchEngineService
    {
        private readonly AppDbContext _context;

        public SearchEngineService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SearchEngineResponseDto> SearchAsync(string query, string? entityType = null, int limit = 20)
        {
            var sw = Stopwatch.StartNew();
            var results = new List<SearchResultItemDto>();
            var normalized = (query ?? string.Empty).Trim().ToLower();

            if (string.IsNullOrWhiteSpace(normalized))
            {
                return new SearchEngineResponseDto
                {
                    Query = query ?? string.Empty,
                    TotalMatches = 0,
                    ExecutionTimeMs = 0,
                    Results = new List<SearchResultItemDto>()
                };
            }

            var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstToken = tokens.Length > 0 ? tokens[0] : normalized;

            bool searchAll = string.IsNullOrEmpty(entityType) || entityType.Equals("all", StringComparison.OrdinalIgnoreCase);

            // 1. Search Students
            if (searchAll || entityType.Equals("students", StringComparison.OrdinalIgnoreCase))
            {
                var students = await _context.Students
                    .AsNoTracking()
                    .Where(s => s.FullName.ToLower().Contains(firstToken) ||
                                s.Nisn.Contains(firstToken) ||
                                s.Nis.Contains(firstToken))
                    .Take(limit * 3)
                    .Select(s => new
                    {
                        s.Id,
                        s.FullName,
                        s.Nisn,
                        s.Nis,
                        s.Gender,
                        s.Status
                    })
                    .ToListAsync();

                foreach (var s in students)
                {
                    double score = CalculateScore(normalized, tokens, s.FullName, s.Nisn, s.Nis);
                    if (score > 0)
                    {
                        results.Add(new SearchResultItemDto
                        {
                            EntityType = "Siswa",
                            Id = s.Id,
                            Title = s.FullName,
                            Subtitle = $"NISN: {s.Nisn} | NIS: {s.Nis}",
                            Description = $"Status: {s.Status} | Gender: {(s.Gender.ToString() == "L" ? "Laki-laki" : "Perempuan")}",
                            Score = score + 10,
                            RouteUrl = $"/students?id={s.Id}",
                            Metadata = new Dictionary<string, string>
                            {
                                { "NISN", s.Nisn },
                                { "NIS", s.Nis },
                                { "Status", s.Status.ToString() }
                            }
                        });
                    }
                }
            }

            // 2. Search Teachers
            if (searchAll || entityType.Equals("teachers", StringComparison.OrdinalIgnoreCase))
            {
                var teachers = await _context.Teachers
                    .AsNoTracking()
                    .Where(t => t.FullName.ToLower().Contains(firstToken) ||
                                (t.Nip != null && t.Nip.Contains(firstToken)))
                    .Take(limit * 3)
                    .Select(t => new
                    {
                        t.Id,
                        t.FullName,
                        t.Nip,
                        t.Position
                    })
                    .ToListAsync();

                foreach (var t in teachers)
                {
                    double score = CalculateScore(normalized, tokens, t.FullName, t.Nip ?? "");
                    if (score > 0)
                    {
                        results.Add(new SearchResultItemDto
                        {
                            EntityType = "Guru",
                            Id = t.Id,
                            Title = t.FullName,
                            Subtitle = $"NIP: {t.Nip ?? "-"} | Jabatan: {t.Position}",
                            Description = $"Tenaga Pendidik: {t.Position}",
                            Score = score + 5,
                            RouteUrl = $"/teachers?id={t.Id}",
                            Metadata = new Dictionary<string, string>
                            {
                                { "NIP", t.Nip ?? "-" },
                                { "Jabatan", t.Position.ToString() }
                            }
                        });
                    }
                }
            }

            // 3. Search Subjects
            if (searchAll || entityType.Equals("subjects", StringComparison.OrdinalIgnoreCase))
            {
                var subjects = await _context.Subjects
                    .AsNoTracking()
                    .Where(sb => sb.Name.ToLower().Contains(firstToken) ||
                                 sb.Code.ToLower().Contains(firstToken))
                    .Take(limit * 2)
                    .Select(sb => new
                    {
                        sb.Id,
                        sb.Name,
                        sb.Code,
                        sb.Kkm
                    })
                    .ToListAsync();

                foreach (var sb in subjects)
                {
                    double score = CalculateScore(normalized, tokens, sb.Name, sb.Code);
                    if (score > 0)
                    {
                        results.Add(new SearchResultItemDto
                        {
                            EntityType = "Mata Pelajaran",
                            Id = sb.Id,
                            Title = sb.Name,
                            Subtitle = $"Kode: {sb.Code} | KKM: {sb.Kkm}",
                            Description = $"Kurikulum Standar (KKM {sb.Kkm})",
                            Score = score,
                            RouteUrl = $"/subjects?id={sb.Id}",
                            Metadata = new Dictionary<string, string>
                            {
                                { "Kode", sb.Code },
                                { "KKM", sb.Kkm.ToString() }
                            }
                        });
                    }
                }
            }

            // 4. Search Classes
            if (searchAll || entityType.Equals("classes", StringComparison.OrdinalIgnoreCase))
            {
                var classes = await _context.Classes
                    .Include(c => c.HomeroomTeacher)
                    .AsNoTracking()
                    .Where(c => c.ClassName.ToLower().Contains(firstToken) ||
                                (c.HomeroomTeacher != null && c.HomeroomTeacher.FullName.ToLower().Contains(firstToken)))
                    .Take(limit * 2)
                    .Select(c => new
                    {
                        c.Id,
                        c.ClassName,
                        c.GradeLevel,
                        HomeroomName = c.HomeroomTeacher != null ? c.HomeroomTeacher.FullName : "-"
                    })
                    .ToListAsync();

                foreach (var c in classes)
                {
                    double score = CalculateScore(normalized, tokens, c.ClassName, $"Tingkat {c.GradeLevel}");
                    if (score > 0)
                    {
                        results.Add(new SearchResultItemDto
                        {
                            EntityType = "Kelas",
                            Id = c.Id,
                            Title = $"Kelas {c.ClassName}",
                            Subtitle = $"Tingkat {c.GradeLevel} | Wali Kelas: {c.HomeroomName}",
                            Description = $"Rombongan belajar tingkat {c.GradeLevel}",
                            Score = score,
                            RouteUrl = $"/classes?id={c.Id}",
                            Metadata = new Dictionary<string, string>
                            {
                                { "Tingkat", c.GradeLevel.ToString() },
                                { "Wali Kelas", c.HomeroomName }
                            }
                        });
                    }
                }
            }

            var counts = results
                .GroupBy(r => r.EntityType)
                .ToDictionary(g => g.Key, g => g.Count());

            var ranked = results
                .OrderByDescending(r => r.Score)
                .Take(limit)
                .ToList();

            sw.Stop();

            return new SearchEngineResponseDto
            {
                Query = query,
                TotalMatches = results.Count,
                ExecutionTimeMs = sw.ElapsedMilliseconds,
                Results = ranked,
                CategoryCounts = counts
            };
        }

        private static double CalculateScore(string fullQuery, string[] tokens, params string[] fields)
        {
            double maxScore = 0;

            foreach (var field in fields)
            {
                if (string.IsNullOrWhiteSpace(field)) continue;
                var lower = field.ToLower();

                if (lower == fullQuery)
                {
                    maxScore = Math.Max(maxScore, 100);
                }
                else if (lower.StartsWith(fullQuery))
                {
                    maxScore = Math.Max(maxScore, 75);
                }
                else if (lower.Contains(fullQuery))
                {
                    maxScore = Math.Max(maxScore, 50);
                }
                else
                {
                    int matchCount = tokens.Count(t => lower.Contains(t));
                    if (matchCount > 0)
                    {
                        double tokenScore = ((double)matchCount / tokens.Length) * 40;
                        maxScore = Math.Max(maxScore, tokenScore);
                    }
                }
            }

            return maxScore;
        }
    }
}

