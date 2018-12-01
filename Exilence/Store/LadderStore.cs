using Exilence.Models;
using Exilence.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Exilence.Store
{
    /*
     * This class is only used since redis for some reason decided to not work well with updating
     * the running status of leagues. Meaning that leagues didn't get updated since one was stuck on running.
     * Dosen't matter that much tho since both of the implementations are stored in memory, the bad part is
     * that we lose all ladders when we re-deploy the API.
     * */
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
                return Ladders[league].OrderBy(t => t.Rank.Overall).ToList();
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
                    Finished = DateTime.MinValue
                });
            }
        }

        public static void SetLadderPending(string league)
        {
            if (!LadderStatus.ContainsKey(league))
            {
                LadderStatus.Add(league, new LadderStatusModel()
                {
                    Running = false,
                    Started = DateTime.MinValue,
                    Finished = DateTime.MinValue
                });
            }
        }

        public static void SetLadderFinished(string league)
        {
            if (LadderStatus.ContainsKey(league))
            {
                if (league == "Standard" || league == "Hardcore")
                {
                    LadderStatus[league].Running = false;
                    LadderStatus[league].Finished = DateTime.Now.AddDays(+1);
                }
                else
                {
                    LadderStatus[league].Running = false;
                    LadderStatus[league].Finished = DateTime.Now;
                }
            }
            else
            {
                throw new Exception("Cannot set not existing ladder to finished");
            }
        }

        public static LadderStatusModel GetLadderStatus(string league)
        {
            if (LadderStatus.ContainsKey(league))
            {
                return LadderStatus[league];
            }

            return null;
        }


        public static void RemoveLadderStatus(string league)
        {
            if (LadderStatus.ContainsKey(league))
            {
                LadderStatus.Remove(league);
            }
        }

        public static string GetNextForUpdate()
        {
            if (LadderStatus.Count > 0)
            {
                var ladder = LadderStatus.OrderByDescending(t => t.Value.Finished).Last();
                return ladder.Key;
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
