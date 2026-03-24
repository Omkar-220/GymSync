using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{
    
    
    public class CreateWorkoutGoalRequest
    {
        public int UserId { get; set; }
        public int TargetExerciseId { get; set; }
        public GoalType Type { get; set; }
        public decimal TargetWeight { get; set; }
        public int? TargetReps { get; set; }
        public DateTime TargetDate { get; set; }
        public string? Notes { get; set; }
    }
    
    public class UpdateWorkoutGoalRequest
    {
        public decimal? TargetWeight { get; set; }
        public int? TargetReps { get; set; }
        public DateTime? TargetDate { get; set; }
        public bool? IsAchieved { get; set; }
        public string? Notes { get; set; }
    }
    
    
    public class WorkoutGoalResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TargetExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public GoalType Type { get; set; }
        public string TypeDisplayName { get; set; } = string.Empty;
        public decimal TargetWeight { get; set; }
        public int? TargetReps { get; set; }
        public DateTime TargetDate { get; set; }
        public bool IsAchieved { get; set; }
        public DateTime? AchievedAt { get; set; }
        public int? AchievedInWorkoutId { get; set; }
        public decimal? AchievedWeight { get; set; }
        public int? AchievedReps { get; set; }
        public decimal? ProgressPercentage { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class WorkoutGoalListResponse
    {
        public int Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public GoalType Type { get; set; }
        public decimal TargetWeight { get; set; }
        public int? TargetReps { get; set; }
        public DateTime TargetDate { get; set; }
        public bool IsAchieved { get; set; }
        public decimal? ProgressPercentage { get; set; }
    }
    

    
    public static class GoalTypeExtensions
    {
        public static string GetDisplayName(this GoalType type)
        {
            return type switch
            {
                GoalType.Strength => "Strength",
                GoalType.Hypertrophy => "Hypertrophy",
                GoalType.Endurance => "Endurance",
                GoalType.WeightLoss => "Weight Loss",
                GoalType.BodyRecomposition => "Body Recomposition",
                _ => type.ToString()
            };
        }
    }
}