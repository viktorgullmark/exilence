using System;
using System.IO;
using Shared.Helper;
using Shared.Models.Log;
using Microsoft.AspNetCore.Mvc;

namespace Exilence.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        [HttpPost]
        [Route("")]
        public IActionResult Index([FromBody]LogModel log)
        {
            var decompressed = CompressionHelper.Decompress<string>(log.Data);

            var timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm");

            var logPath = $"Logs\\Users\\{log.Account}\\{timestamp}\\";

            if (!Directory.Exists(logPath))
                Directory.CreateDirectory(logPath);

            using (StreamWriter writer = System.IO.File.AppendText(logPath + "settings.txt"))
            {
                writer.WriteLine(log.Settings);
            }
            using (StreamWriter writer = System.IO.File.AppendText(logPath + "log.txt"))
            {
                writer.WriteLine(decompressed);
            }
            return Ok();
        }
    }
}