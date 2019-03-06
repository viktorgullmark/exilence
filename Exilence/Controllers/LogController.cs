using System;
using System.IO;
using Shared.Helper;
using Shared.Models.Log;
using Microsoft.AspNetCore.Mvc;
using Shared.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        private IMongoRepository _repository;

        public LogController(IMongoRepository repository)
        {
            _repository = repository;
        }

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

        [HttpPost]
        [Route("PriceFluctuations")]
        public async Task<IActionResult> PriceFluctuations([FromBody]List<PriceFluctuationModel> priceFluctuations)
        {
            await _repository.LogPriceFluctuations(priceFluctuations);

            return Ok();
        }
    }
}