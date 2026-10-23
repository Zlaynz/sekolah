using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SekolahApi.Services.Search;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/search")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchEngineService _searchEngine;

        public SearchController(ISearchEngineService searchEngine)
        {
            _searchEngine = searchEngine;
        }

        [HttpGet]
        public async Task<IActionResult> Search(
            [FromQuery] string q,
            [FromQuery] string? type = null,
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new { query = "", totalMatches = 0, results = new object[0] });
            }

            var result = await _searchEngine.SearchAsync(q, type, limit);
            return Ok(result);
        }
    }
}

