using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SekolahApi.Data;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace SekolahApi.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ReferentialConstraintException ex)
            {
                _logger.LogWarning("Referential constraint violation: {Message}", ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;

                var response = new
                {
                    statusCode = 422,
                    error = "Unprocessable Entity",
                    message = ex.Message,
                    targetTable = ex.TargetTable,
                    conflictChildTable = ex.ConflictChildTable
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid operation: {Message}", ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status400BadRequest;

                var response = new
                {
                    statusCode = 400,
                    error = "Bad Request",
                    message = ex.Message
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred.");
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var response = new
                {
                    statusCode = 500,
                    error = "Internal Server Error",
                    message = ex.Message
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }
}

