namespace Shared.Models.Log
{
    public class PriceFluctuationModel
    {
        public string ItemName { get; set; }
        public int TotalChange { get; set; }
        public int ChaosEquiv { get; set; }
        public long Timestamp { get; set; }
    }
}
