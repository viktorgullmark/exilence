using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace LadderParser
{
    public class DisposableStopwatch : IDisposable
    {
        public readonly Stopwatch sw;

        public DisposableStopwatch()
        {
            sw = Stopwatch.StartNew();
        }

        public void Dispose()
        {
            sw.Stop();
        }
    }
}
