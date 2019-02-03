using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Exilence.Helper
{
    public static class Extensions
    {
        public static List<List<T>> Split<T>(this List<T> source, int chunkSize)
        {
            return source
                .Select((x, i) => new { Index = i, Value = x })
                .GroupBy(x => x.Index / chunkSize)
                .Select(x => x.Select(v => v.Value).ToList())
                .ToList();
        }

        public static IEnumerable<Tuple<T, T, T>> WithNextAndPrevious<T>(this IEnumerable<T> source)
        {
            // Actually yield "the previous two" as well as the current one - this
            // is easier to implement than "previous and next" but they're equivalent
            using (IEnumerator<T> iterator = source.GetEnumerator())
            {
                if (!iterator.MoveNext())
                {
                    yield break;
                }
                T lastButOne = iterator.Current;
                if (!iterator.MoveNext())
                {
                    yield break;
                }
                T previous = iterator.Current;
                while (iterator.MoveNext())
                {
                    T current = iterator.Current;
                    yield return Tuple.Create(lastButOne, previous, current);
                    lastButOne = previous;
                    previous = current;
                }
            }
        }

        public static double ToUnixTimeStamp(this DateTime dateTime)
        {
            return (TimeZoneInfo.ConvertTimeToUtc(dateTime) - new DateTime(1970, 1, 1)).TotalSeconds;
        }

        public static string ToValidPartyName(this string name)
        {
            return new string(name.Where(c => char.IsLetterOrDigit(c)).ToArray());
        }

    }
}
