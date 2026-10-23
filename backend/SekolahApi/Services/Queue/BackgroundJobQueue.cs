using SekolahApi.Models.DTOs.Queue;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace SekolahApi.Services.Queue
{
    public interface IBackgroundJobQueue
    {
        ValueTask EnqueueAsync(JobDto job, CancellationToken cancellationToken = default);
        ValueTask<JobDto> DequeueAsync(CancellationToken cancellationToken);
        JobDto? GetJob(string jobId);
        IEnumerable<JobDto> GetAllJobs();
        void UpdateJob(JobDto job);
    }

    public class BackgroundJobQueue : IBackgroundJobQueue
    {
        private readonly Channel<JobDto> _queue;
        private readonly ConcurrentDictionary<string, JobDto> _jobs = new();

        public BackgroundJobQueue(int capacity = 100)
        {
            var options = new BoundedChannelOptions(capacity)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _queue = Channel.CreateBounded<JobDto>(options);
        }

        public async ValueTask EnqueueAsync(JobDto job, CancellationToken cancellationToken = default)
        {
            _jobs[job.Id] = job;
            await _queue.Writer.WriteAsync(job, cancellationToken);
        }

        public async ValueTask<JobDto> DequeueAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }

        public JobDto? GetJob(string jobId)
        {
            _jobs.TryGetValue(jobId, out var job);
            return job;
        }

        public IEnumerable<JobDto> GetAllJobs()
        {
            return _jobs.Values;
        }

        public void UpdateJob(JobDto job)
        {
            _jobs[job.Id] = job;
        }
    }
}

