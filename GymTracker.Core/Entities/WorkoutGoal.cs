using GymTrakcer.Core.Enums;
namespace GymTracker.Core.Entities
{
    public class WorkoutGoal{
    public int Id { get; set; }
    public int UserId { get; set; }
    public GoalType Type { get; set; }  // Strength, Hypertrophy, Endurance, WeightLoss
    public int TargetExerciseId { get; set; }
    public decimal TargetWeight { get; set; }
    public int? TargetReps { get; set; }
    public DateTime TargetDate { get; set; }
    public bool IsAchieved { get; set; }
    public DateTime? AchievedAt { get; set; }
    
    public User User { get; set; }
    }
}