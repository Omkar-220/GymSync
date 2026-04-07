using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class WorkoutGoal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TargetExerciseId { get; set; }
        public PRType Type { get; set; }  // OneRepMax, FiveRepMax, TotalVolume, etc.
        public decimal TargetValue { get; set; }  // Target weight or volume
        public int? TargetReps { get; set; }  // Optional: specific reps for the goal
        public DateTime TargetDate { get; set; }
        public bool IsAchieved { get; set; }
        public DateTime? AchievedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public int? AchievedInWorkoutId { get; set; }
        public decimal? AchievedValue { get; set; }
        public int? AchievedReps { get; set; }
        
        
        public User User { get; set; } = null!;
        public Exercise TargetExercise { get; set; } = null!;
        public Workout? AchievedInWorkout { get; set; }
    }
}