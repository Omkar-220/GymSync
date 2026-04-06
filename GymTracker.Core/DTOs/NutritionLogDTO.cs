namespace GymTracker.Core.DTOs
{
     public class LogNutritionRequest
    {
        public int UserId { get; set; }
        public DateTime LogDate { get; set; }
        
        // Macros
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public decimal? Fiber { get; set; }
        
        // Minerals
        public decimal? Zinc { get; set; }
        public decimal? Magnesium { get; set; }
        // public decimal? Calcium { get; set; }
        public decimal? Iron { get; set; }
        // public decimal? Potassium { get; set; }
        // public decimal? Sodium { get; set; }
        
        // Performance
        public decimal? Creatine { get; set; }
        public decimal? Omega3 { get; set; }
        
        public decimal? Calories { get; set; }
        public string? Notes { get; set; }
    }


    public class NutritionLogResponse
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        
        // Macros
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public decimal Fiber { get; set; }
        
        // Minerals
        public decimal Zinc { get; set; }
        public decimal Magnesium { get; set; }
        // public decimal Calcium { get; set; }
        public decimal Iron { get; set; }
        // public decimal Potassium { get; set; }
        // public decimal Sodium { get; set; }
        
        // Performance
        public decimal Creatine { get; set; }
        public decimal Omega3 { get; set; }
        
        public decimal Calories { get; set; }
        public string? Notes { get; set; }
        public int? WorkoutId { get; set; }
        
        // Calculated fields for insights
        public bool MeetsProteinGoal { get; set; }
        public bool MeetsFiberGoal { get; set; }
        public string? Recommendation { get; set; }
    }   
 
    public class NutritionSummaryResponse
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Averages
        public decimal AvgProtein { get; set; }
        public decimal AvgCarbs { get; set; }
        public decimal AvgFats { get; set; }
        public decimal AvgFiber { get; set; }
        public decimal AvgCalories { get; set; }
        
        // Mineral averages
        public decimal AvgZinc { get; set; }
        public decimal AvgMagnesium { get; set; }
        public decimal AvgIron { get; set; }
        
        // Totals
        public decimal TotalProtein { get; set; }
        public decimal TotalCalories { get; set; }
        public int DaysLogged { get; set; }
        
        // Goals met
        public int DaysMetProteinGoal { get; set; }
        public int DaysMetFiberGoal { get; set; }
        
        // Recommendations
        public List<string> Recommendations { get; set; } = new();
        public string? OverallRating { get; set; }
    }
}
    
    // public class LogNutritionRequest
    // {
    //     public int UserId { get; set; }
    //     public DateTime LogDate { get; set; }
    //     public decimal Protein { get; set; }
    //     public decimal Carbs { get; set; }
    //     public decimal Fats { get; set; }
    //     public decimal Zinc { get; set; }
    //     public decimal? Calories { get; set; }  // Optional - auto-calculated if not provided
    //     public string? Notes { get; set; }
        
    // }
    
  
    
    // public class NutritionLogResponse
    // {
    //     public int Id { get; set; }
    //     public DateTime LogDate { get; set; }
    //     public decimal Protein { get; set; }
    //     public decimal Carbs { get; set; }
    //     public decimal Fats { get; set; }
    //     public decimal Zinc { get; set; }
    //     public decimal Calories { get; set; }
    //     public string? Notes { get; set; }
    //     public int? WorkoutId { get; set; }
    //     public bool IsMeetingRecommendations { get; set; }
    //     public string? Recommendations { get; set; }
    // }
    
    // public class NutritionSummaryResponse
    // {
    //     public DateTime Date { get; set; }
    //     public decimal TotalProtein { get; set; }
    //     public decimal TotalCarbs { get; set; }
    //     public decimal TotalFats { get; set; }
    //     public decimal TotalZinc { get; set; }
    //     public decimal TotalCalories { get; set; }
    //     public bool IsComplete { get; set; }
    //     public int MealsLogged { get; set; }
    //     public string? DailyRecommendation { get; set; }
    // }
