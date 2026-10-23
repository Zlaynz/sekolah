using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SekolahApi.Models.DTOs.Queue;
using SekolahApi.Services.Queue;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SekolahApi.BackgroundJobs
{
    public class JobQueueWorker : BackgroundService
    {
        private readonly IBackgroundJobQueue _jobQueue;
        private readonly ILogger<JobQueueWorker> _logger;

        public JobQueueWorker(IBackgroundJobQueue jobQueue, ILogger<JobQueueWorker> logger)
        {
            _jobQueue = jobQueue;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("JobQueueWorker background service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var job = await _jobQueue.DequeueAsync(stoppingToken);

                    _logger.LogInformation("Processing queued job: {JobId} ({JobTitle})", job.Id, job.Title);
                    job.Status = JobStatus.Processing;
                    job.Progress = 10;
                    _jobQueue.UpdateJob(job);

                    // Simulate heavy asynchronous task (e.g. PDF report compilation, grade aggregation)
                    for (int p = 20; p <= 90; p += 30)
                    {
                        await Task.Delay(1000, stoppingToken);
                        job.Progress = p;
                        _jobQueue.UpdateJob(job);
                    }

                    job.Progress = 100;
                    job.Status = JobStatus.Completed;
                    job.CompletedAt = DateTime.UtcNow;
                    job.ResultUrl = $"/api/reports/download-simulated/{job.Id}";
                    _jobQueue.UpdateJob(job);

                    _logger.LogInformation("Completed queued job: {JobId}", job.Id);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing background job");
                }
            }

            _logger.LogInformation("JobQueueWorker background service stopped.");
        }
    }
}

