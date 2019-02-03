using Shared.Interfaces;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using LadderService.Interfaces;

namespace LadderService.Services
{
    public class ExternalService : IExternalService
    {
        private readonly HttpClient _httpClient;

        public ExternalService(HttpClient httpClient)
        {
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
            } catch(Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
        }
    }
}
