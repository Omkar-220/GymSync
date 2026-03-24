using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int DifficultyLevel { get; set; } 
        public int EstimatedCaloriesPerSet { get; set; }
        public decimal DefaultWeightIncrement { get; set; } = 2.5m;
        public int TotalUsersPerformed { get; set; }
        public bool IsMeasurable { get; set; } = true;
        public MeasurementType MeasurementType { get; set; }
        
        // Navigation properties
        public ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
        public ICollection<SplitExercise> SplitExercises { get; set; } = new List<SplitExercise>();
        public ICollection<PersonalRecord> PersonalRecords { get; set; } = new List<PersonalRecord>();
        public ICollection<WorkoutGoal> WorkoutGoals { get; set; } = new List<WorkoutGoal>(); 
    }
}