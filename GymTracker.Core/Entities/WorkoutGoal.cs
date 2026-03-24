using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class WorkoutGoal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public GoalType Type { get; set; }  // Strength, Hypertrophy, Endurance, WeightLoss
        public int TargetExerciseId { get; set; }
        public decimal TargetWeight { get; set; }
        public int? TargetReps { get; set; }
        public DateTime TargetDate { get; set; }
        public bool IsAchieved { get; set; }
        public DateTime? AchievedAt { get; set; }
        
       
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public int? AchievedInWorkoutId { get; set; }  // Which workout achieved this goal
       
        public User User { get; set; } = null!;
        public Exercise TargetExercise { get; set; } = null!;
        public Workout? AchievedInWorkout { get; set; }
    }
}