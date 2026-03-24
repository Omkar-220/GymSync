namespace GymTracker.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTimexx CreatedAt { get; set; } = DateTime.UtcNow;
        
            
        public ICollection<Split> Splits { get; set; } = new List<Split>();
        public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
        public ICollection<NutritionLog> NutritionLogs { get; set; } = new List<NutritionLog>();
        public ICollection<NutritionLog> PersonalRecords {get; set; } = new List<PersonalRecord>();
    }   
}