namespace GymTracker.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string FirstName { get; set; } = string.Empty;  
        public string LastName { get; set; } = string.Empty;   
        public decimal? Weight { get; set; }                   
        public decimal? Height { get; set; }                   
        public bool IsActive { get; set; } = true;             
        
            
        public ICollection<Split> Splits { get; set; } = new List<Split>();
        public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
        public ICollection<NutritionLog> NutritionLogs { get; set; } = new List<NutritionLog>();
        public ICollection<PersonalRecord> PersonalRecords { get; set; } = new List<PersonalRecord>();
        public ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();  
        public ICollection<WorkoutGoal> WorkoutGoals { get; set; } = new List<WorkoutGoal>();  

    }   
}