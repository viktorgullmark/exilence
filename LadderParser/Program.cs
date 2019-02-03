
using Microsoft.Extensions.DependencyInjection;
using Shared.Repositories;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Http;
using System.IO;
using Shared.Interfaces;
using LadderParser.Interfaces;
using LadderParser.Services;
using Microsoft.Extensions.Hosting;

namespace LadderParser
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            var host = new HostBuilder()
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    config.AddJsonFile("appsettings.json", optional: true);
                })
                 .ConfigureServices((hostContext, services) =>
                 {
                     services.AddHttpClient<IExternalService, ExternalService>();
                     services.AddHostedService<TimedHostedService>();
                     services.AddSingleton<ILadderService, LadderService>();
                     services.AddSingleton<IRedisRepository, RedisRepository>();
                     services
                         .AddDistributedRedisCache(options =>
                        {
                            options.Configuration = hostContext.Configuration.GetConnectionString("Redis");
                            options.InstanceName = "Exilence:";
                        });
                 })
                .UseConsoleLifetime()
                .Build();

            using (host)
            {
                // Start the host
                await host.StartAsync();

                // Wait for the host to shutdown
                await host.WaitForShutdownAsync();
            }
        }
    }
}
