using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{
    
    
    public class StartWorkoutRequest
    {
        public int UserId { get; set; }
        public DayOfWeek Day { get; set; }
        public bool AllowDuplicate { get; set; } = false;
    }
    
    public class LogSetRequest
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
    
    public class CompleteWorkoutRequest
    {
        public int WorkoutId { get; set; }
        public int DurationMinutes { get; set; }
        public int? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsSkipped { get; set; } = false;
    }
    
    // ========== RESPONSE DTOS ==========
    
    public class WorkoutResponse
    {
        public int Id { get; set; }
        public DateTime WorkoutDate { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int? SplitId { get; set; }
        public string SplitTag { get; set; } = string.Empty;
        public TrainingStyle TrainingStyle { get; set; }
        public int TotalSets { get; set; }
        public decimal TotalVolume { get; set; }
        public int PersonalRecordsCount { get; set; }
        public int DurationMinutes { get; set; }
        public int? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public List<WorkoutSetResponse> Sets { get; set; } = new();
    }
    
    public class WorkoutSetResponse
    {
        public int Id { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public FormQuality FormQuality { get; set; }
        public int? PerceivedExertion { get; set; }
        public decimal EstimatedOneRepMax { get; set; }
        public bool IsPersonalRecord { get; set; }
    }
    
    public class WorkoutListResponse
    {
        public int Id { get; set; }
        public DateTime WorkoutDate { get; set; }
        public string SplitTag { get; set; } = string.Empty;
        public TrainingStyle TrainingStyle { get; set; }
        public int TotalSets { get; set; }
        public decimal TotalVolume { get; set; }
        public int PersonalRecordsCount { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsSkipped { get; set; }
    }
    
    public class WorkoutProgressResponse
    {
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public List<DailyProgressResponse> ProgressData { get; set; } = new();
    }
    
    public class DailyProgressResponse
    {
        public DateTime Date { get; set; }
        public decimal MaxWeight { get; set; }
        public decimal TotalVolume { get; set; }
        public int SetsCompleted { get; set; }
        public WorkoutSetSummaryDto BestSet { get; set; } = null!;
    }
    
    public class WorkoutSetSummaryDto
    {
        public int Id { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public FormQuality FormQuality { get; set; }
    }
    
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