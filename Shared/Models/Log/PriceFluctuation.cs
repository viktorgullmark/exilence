namespace Shared.Models.Log
{
    public class PriceFluctuationModel
    {
        public string ItemName { get; set; }
        public decimal TotalChange { get; set; }
        public decimal ChaosEquiv { get; set; }
        public long Timestamp { get; set; }
    }
}
