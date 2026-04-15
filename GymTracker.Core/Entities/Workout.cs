using GymTracker.Core.Enums;

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
        public bool IsSkipped { get; set; } = false;
        public DateTime? CompletedAt { get; set; }      // set when IsCompleted = true
        public int? DurationMinutes { get; set; }       // in minutes
        public int? Rating { get; set; }                // RPE 1-10
        public string? Notes { get; set; }

        public User User { get; set; } = null!;
        public Split? Split { get; set; }               // nullable — custom workouts have no split
        public ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
        public ICollection<WorkoutGoal> AchievedGoals { get; set; } = new List<WorkoutGoal>();
    }
}