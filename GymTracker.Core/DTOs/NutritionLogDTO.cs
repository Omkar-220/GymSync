namespace GymTracker.Core.DTOs
{
   
    
    public class LogNutritionRequest
    {
        public int UserId { get; set; }
        public DateTime LogDate { get; set; }
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public decimal Zinc { get; set; }
        public decimal? Calories { get; set; }  // Optional - auto-calculated if not provided
        public string? Notes { get; set; }
        
    }
    
  
    
    public class NutritionLogResponse
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public decimal Zinc { get; set; }
        public decimal Calories { get; set; }
        public string? Notes { get; set; }
        public int? WorkoutId { get; set; }
        public bool IsMeetingRecommendations { get; set; }
        public string? Recommendations { get; set; }
    }
    
    public class NutritionSummaryResponse
    {
        public DateTime Date { get; set; }
        public decimal TotalProtein { get; set; }
        public decimal TotalCarbs { get; set; }
        public decimal TotalFats { get; set; }
        public decimal TotalZinc { get; set; }
        public decimal TotalCalories { get; set; }
        public bool IsComplete { get; set; }
        public int MealsLogged { get; set; }
        public string? DailyRecommendation { get; set; }
    }
}