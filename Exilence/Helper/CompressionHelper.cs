using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Exilence.Models;
using Microsoft.ApplicationInsights;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Exilence.Helper
{
    public static class CompressionHelper
    {
        public static string Compress<T>(T input)
        {
            var sw = new Stopwatch();
            var _telemetry = new TelemetryClient();

            var jsonString = JsonConvert.SerializeObject(input, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });

            var buffer = Encoding.UTF8.GetBytes(jsonString);
            string base64String = null;

            using (var outputStream = new MemoryStream())
            {
                using (var gZipStream = new GZipStream(outputStream, CompressionMode.Compress))
                    gZipStream.Write(buffer, 0, buffer.Length);

                var outputBytes = outputStream.ToArray();

                base64String = Convert.ToBase64String(outputBytes);

            }

            var elapsed = sw.ElapsedMilliseconds * 1000;
            _telemetry.GetMetric("CompressionHelper.Compress").TrackValue(elapsed);
            
            return base64String;

        }

        public static T Decompress<T>(string input)
        {
            var sw = new Stopwatch();
            var _telemetry = new TelemetryClient(); 

            string jsonString = null;

            byte[] inputBytes = Convert.FromBase64String(input);

            using (var inputStream = new MemoryStream(inputBytes))
            using (var gZipStream = new GZipStream(inputStream, CompressionMode.Decompress))
            using (var streamReader = new StreamReader(gZipStream))
            {
                jsonString = streamReader.ReadToEnd();

            }

            var elapsed = sw.ElapsedMilliseconds * 1000;
            _telemetry.GetMetric("CompressionHelper.Decompress").TrackValue(elapsed);

            return JsonConvert.DeserializeObject<T>(jsonString);

        }
    }
}
