namespace GymTracker.Core.Entities
{
    public class NutritionLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime LogDate { get; set; } = DateTime.UtcNow.Date;
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public decimal Zinc { get; set; }
        public decimal Calories { get; set; }
        public string Notes { get; set; } = string.Empty;
        
        
        public User User { get; set; } = null!;
    }
}