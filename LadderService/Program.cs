
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
using LadderService.Interfaces;
using LadderService.Services;

namespace LadderService
{
    class Program
    {
        public static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json");

            var configuration = builder.Build();

            //setup our DI
            var serviceProvider = new ServiceCollection();

            serviceProvider
                .AddDistributedRedisCache(options =>
                {
                    options.Configuration = configuration.GetConnectionString("Redis");
                    options.InstanceName = "Exilence:";
                });
            serviceProvider.AddHttpClient<IExternalService, ExternalService>();
            serviceProvider.BuildServiceProvider();

            string test = configuration["ConnectionStrings:Redis"];
            Console.WriteLine(test);

            Console.ReadKey();
        }
    }
}
