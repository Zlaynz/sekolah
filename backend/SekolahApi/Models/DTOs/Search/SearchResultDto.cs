using System.Collections.Generic;

namespace SekolahApi.Models.DTOs.Search
{
    public class SearchResultItemDto
    {
        public string EntityType { get; set; } = string.Empty; // Student, Teacher, Subject, Class
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Score { get; set; }
        public string RouteUrl { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
    }

    public class SearchEngineResponseDto
    {
        public string Query { get; set; } = string.Empty;
        public int TotalMatches { get; set; }
        public long ExecutionTimeMs { get; set; }
        public List<SearchResultItemDto> Results { get; set; } = new();
        public Dictionary<string, int> CategoryCounts { get; set; } = new();
    }
}

