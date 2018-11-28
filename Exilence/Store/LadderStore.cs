using Exilence.Models;
using Exilence.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Exilence.Store
{
    public class LadderStore
    {
        private static Dictionary<string, LadderStatusModel> LadderStatus { get; set; }
        private static Dictionary<string, List<LadderPlayerModel>> Ladders { get; set; }

        public static void Initialize()
        {
            LadderStatus = new Dictionary<string, LadderStatusModel>();
            Ladders = new Dictionary<string, List<LadderPlayerModel>>();
        }

        public static List<LadderPlayerModel> GetLadder(string league)
        {
            if (Ladders.ContainsKey(league))
            {
                return Ladders[league].OrderBy(t => t.Rank).ToList();
            }

            return new List<LadderPlayerModel>();
        }

        public static bool SetLadder(string league, List<LadderPlayerModel> ladder)
        {
            return Ladders.TryAdd(league, ladder);
        }

        public static void SetLadderRunning(string league)
        {
            if (LadderStatus.ContainsKey(league))
            {
                LadderStatus[league].Running = true;
                LadderStatus[league].Started = DateTime.Now;
            }
            else
            {
                LadderStatus.Add(league, new LadderStatusModel()
                {
                    Running = true,
                    Started = DateTime.Now,
                    Finished = null
                });
            }
        }

        public static void SetLadderFinished(string league)
        {
            if (LadderStatus.ContainsKey(league))
            {
                LadderStatus[league].Running = false;
                LadderStatus[league].Finished = DateTime.Now;
            }
            else
            {
                throw new Exception("Cannot set not existing ladder to finished");
            }
        }

        public static LadderStatusModel GetLadderStatus(string league)
        {
            if(LadderStatus.ContainsKey(league))
            {
                return LadderStatus[league];
            }

            return null;
        }


        public static Dictionary<string, LadderStatusModel> GeAllLadderStatuses()
        {
            return LadderStatus;
        }

        public static bool AnyRunning()
        {
            return LadderStatus.Any(t => t.Value.Running);
        }

    }


}
