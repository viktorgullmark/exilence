using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Exilence.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

using K4os.Compression.LZ4.Streams;
using K4os.Hash.xxHash;
using Exilence.Encoding;

namespace Exilence.Encoding
{
    public static class CompressionHelper
    {
        public static string Compress<T>(T input)
        {
            var jsonString = JsonConvert.SerializeObject(input, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });

            //inputStream is the output of the jsonString object.
            using (var inputStream = new MemoryStream())
            {
                var output = LZ4Stream.Encode(inputStream);

                return output.ToString();
            }
        }

        public static T Decompress<T>(string input)
        {
            string jsonString = null;

            byte[] inputBytes = Convert.FromBase64String(input);

            var inputStream = new MemoryStream(inputBytes);
            var output = LZ4Stream.Decode(inputStream);

            using (var streamReader = new StreamReader(output))
            {
                jsonString = streamReader.ReadToEnd();

            }

            return JsonConvert.DeserializeObject<T>(jsonString);

        }
    }
}
