using System.Net;
using System.Threading.Tasks;
using Exilence.Interfaces;
using Exilence.Services;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Exilence
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var webHost = CreateWebHostBuilder(args).Build();

            // Create a new scope
            using (var scope = webHost.Services.CreateScope())
            {
                var backendService = scope.ServiceProvider.GetRequiredService<IBackendService>();
                await backendService.clearDisconnectedPlayers();
            }

            await webHost.RunAsync();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseKestrel(options =>
                {
                    options.Listen(IPAddress.Loopback, 5678);
                })
                .ConfigureLogging((hostingContext, builder) =>
                {
                    
                    builder.AddFilter((provider, category, logLevel) =>
                    {
                        if (
                        logLevel == LogLevel.Trace ||
                        logLevel == LogLevel.Debug ||
                        logLevel == LogLevel.Warning ||
                        logLevel == LogLevel.Information
                        )
                        {
                            return false;
                        }

                        return true;
                    });


                    builder.AddFile("Logs/Exilence-{Date}.txt");
                })
                .UseStartup<Startup>();
    }
}
