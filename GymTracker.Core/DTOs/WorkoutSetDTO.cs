using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{

    public class CreateWorkoutSetRequest
    {
        public int WorkoutId { get; set; }
        public int ExerciseId { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public FormQuality FormQuality { get; set; } = FormQuality.Good;
        public int? RepsInReserve { get; set; }
        public int? PerceivedExertion { get; set; }
    }
    
    public class UpdateWorkoutSetRequest
    {
        public decimal? Weight { get; set; }
        public int? Reps { get; set; }
        public FormQuality? FormQuality { get; set; }
        public int? RepsInReserve { get; set; }
        public int? PerceivedExertion { get; set; }
        public bool? IsCompleted { get; set; }
    }
    
 
    
    public class WorkoutSetResponse
    {
        public int Id { get; set; }
        public int WorkoutId { get; set; }
        public int ExerciseId { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public decimal Volume { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public FormQuality FormQuality { get; set; }
        public int? RepsInReserve { get; set; }
        public int? PerceivedExertion { get; set; }
        public SetQuality Quality { get; set; }
        public DateTime CompletedAt { get; set; }
        public decimal EstimatedOneRepMax { get; set; }
        public bool IsPersonalRecord { get; set; }
    }
    
    public class WorkoutSetListResponse
    {
        public int Id { get; set; }
        public int WorkoutId { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}