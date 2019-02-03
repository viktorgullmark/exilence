using Exilence.Hubs;
using Exilence.Interfaces;
using Exilence.Repositories;
using Exilence.Services;
using Hangfire;
using Hangfire.MemoryStorage;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;

namespace Exilence
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHangfire(c => c.UseMemoryStorage());

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            //Add distributed cache service backed by Redis cache
            services.AddDistributedRedisCache(options =>
            {
                options.Configuration = Configuration.GetConnectionString("Redis");
                options.InstanceName = "Exilence:";
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyHeader();
                        builder.WithOrigins("http://localhost:4200", "http://exilence.app");
                        builder.AllowAnyMethod();
                        builder.AllowCredentials();
                    });
            });

            services
                .AddSignalR(hubOptions => {
                    hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(40);
                })
                .AddStackExchangeRedis(Configuration.GetConnectionString("Redis"), options =>
                {
                    options.Configuration.ChannelPrefix = "ExilenceSignalR";
                    options.Configuration.ConnectTimeout = 10000;
                });

            services.AddScoped<ILadderService, LadderService>();
            services.AddHttpClient<IExternalService, ExternalService>();
            services.AddScoped<IRedisRepository, RedisRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowAll");
            app.UseMvc();
            app.UseFileServer();

            GlobalConfiguration.Configuration.UseActivator(new HangfireActivator(serviceProvider));

            var hangfireOpts = new BackgroundJobServerOptions
            {
                SchedulePollingInterval = TimeSpan.FromMilliseconds(1000)
            };

            app.UseHangfireServer(hangfireOpts);
            app.UseHangfireDashboard();

            if (Configuration.GetValue<bool>("Ladder:PollingEnabled")) { 
                BackgroundJob.Schedule<ILadderService>(ls => ls.UpdateLadders(), TimeSpan.FromMilliseconds(5000));
            }

            app.UseSignalR(routes =>
            {
                routes.MapHub<PartyHub>("/api/hubs/party", options =>
                {
                    options.ApplicationMaxBufferSize = 50 * 1024 * 1024;
                    options.TransportMaxBufferSize = 50 * 1024 * 1024;
                });
            });
        }

    }
}
