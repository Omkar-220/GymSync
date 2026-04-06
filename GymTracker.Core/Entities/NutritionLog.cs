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
        public decimal Fiber { get; set; }
        
        
        public decimal Zinc { get; set; }
        public decimal Magnesium { get; set; }
        // public decimal Calcium { get; set; }
        public decimal Iron { get; set; }
        // public decimal Potassium { get; set; }
        // public decimal Sodium { get; set; }
        
        
        public decimal Creatine { get; set; }     // grams
        public decimal Omega3 { get; set; }       // grams
        
        
        public decimal Calories { get; set; }
        
        
        public string? Notes { get; set; }
        public int? WorkoutId { get; set; }
        
        
        public User User { get; set; } = null!;
        public Workout? Workout { get; set; }
    }
}