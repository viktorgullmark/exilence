using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Exilence.Helper;
using Exilence.Models.Log;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        [HttpPost]
        [Route("")]
        public IActionResult Index([FromBody]LogModel log)
        {
            var decompressed = CompressionHelper.Decompress<string>(log.Data);

            var timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm");

            var logPath = $"Logs\\{log.Account}\\{timestamp}\\";

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