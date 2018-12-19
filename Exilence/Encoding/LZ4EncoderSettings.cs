using K4os.Compression.LZ4;
using K4os.Compression.LZ4.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Encoding
{
    class LZ4EncoderSettings
    {
        long? ContentLength { get; set; } = null;
        bool ChainBlocks { get; set; } = true;
        int BlockSize { get; set; } = Mem.K64;
        bool ContentChecksum => false;
        bool BlockChecksum => false;
        uint? Dictionary => null;
        LZ4Level CompressionLevel { get; set; } = LZ4Level.L00_FAST;
        int ExtraMemory { get; set; } = 0;
    }
}
