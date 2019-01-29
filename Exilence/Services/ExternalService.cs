using Shared.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Exilence.Interfaces;

namespace Shared.Services
{
    public class ExternalService : IExternalService
    {
        private readonly ILogger<ExternalService> _log;
        private readonly HttpClient _httpClient;

        public ExternalService(ILogger<ExternalService> log, HttpClient httpClient)
        {
            _log = log;
            _httpClient = httpClient;
        }

        public async Task<string> ExecuteGetAsync(string url)
        {
            try
            {
                HttpResponseMessage res = await _httpClient.GetAsync(url);
                
                if (res.IsSuccessStatusCode)
                {
                    HttpContent content = res.Content;

                    return await content.ReadAsStringAsync();
                }

                return null;
            }
            catch (Exception e)
            {
                if (e is TaskCanceledException)
                {
                    _log.LogCritical($"Request timed out after 12 seconds.");
                }
                else
                {
                    _log.LogCritical($"Exception: {e.Message}");
                }

                return null;
            }
        }


    }
}
