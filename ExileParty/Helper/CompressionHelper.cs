using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExileParty.Models;
using Newtonsoft.Json;

namespace ExileParty.Helper
{
    public static class CompressionHelper
    {
        public static string Gzip<T>(T input)
        {
            var jsonString = JsonConvert.SerializeObject(input);

            var buffer = Encoding.UTF8.GetBytes(jsonString);

            using (var outputStream = new MemoryStream())
            {
                using (var gZipStream = new GZipStream(outputStream, CompressionMode.Compress))
                    gZipStream.Write(buffer, 0, buffer.Length);

                var outputBytes = outputStream.ToArray();

                var base64String = Convert.ToBase64String(outputBytes);

                return base64String;
            }
        }

        public static T GunzipAndConvert<T>(string input)
        {
            string jsonString = null;


            byte[] inputBytes = Convert.FromBase64String(input);

            using (var inputStream = new MemoryStream(inputBytes))
            using (var gZipStream = new GZipStream(inputStream, CompressionMode.Decompress))
            using (var streamReader = new StreamReader(gZipStream))
            {
                jsonString = streamReader.ReadToEnd();

            }

            return JsonConvert.DeserializeObject<T>(jsonString);

        }
    }
}
