using GymTracker.Core.Enums;  // ✅ ADD THIS

namespace GymTracker.Core.Entities
{
    public class Workout
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime WorkoutDate { get; set; } = DateTime.UtcNow;
        public int? SplitId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }      
        public int? DurationMinutes { get; set; }       
        public int? Rating { get; set; }                
        public string? Notes { get; set; }              
        // public PRType Type { get; set; } 
        public User User { get; set; } = null!;
        public Split Split { get; set; } = null!;
        public ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
        public ICollection<WorkoutGoal> AchievedGoals { get; set; } = new List<WorkoutGoal>(); 
    }
}