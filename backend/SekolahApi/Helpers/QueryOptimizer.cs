using Microsoft.EntityFrameworkCore;
using SekolahApi.Models.DTOs.Common;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace SekolahApi.Helpers
{
    public static class QueryOptimizer
    {
        /// <summary>
        /// Query Optimization: Paginates and projects an IQueryable using AsNoTracking to minimize memory overhead.
        /// </summary>
        public static async Task<PagedResult<TDto>> ToPagedListAsync<TEntity, TDto>(
            this IQueryable<TEntity> source,
            int page,
            int pageSize,
            Expression<Func<TEntity, TDto>> projection) where TEntity : class
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var noTrackingQuery = source.AsNoTracking();
            var totalCount = await noTrackingQuery.CountAsync();

            var items = await noTrackingQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(projection)
                .ToListAsync();

            return new PagedResult<TDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public static async Task<PagedResult<T>> ToPagedListAsync<T>(
            this IQueryable<T> source,
            int page,
            int pageSize) where T : class
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var noTrackingQuery = source.AsNoTracking();
            var totalCount = await noTrackingQuery.CountAsync();

            var items = await noTrackingQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}

