using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{
    // ========== REQUEST DTOS (Input) ==========
    
    public class AddExerciseToSplitRequest
    {
        public int ExerciseId { get; set; }
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
        public int? DefaultRestTime { get; set; } // Seconds between sets
        public string? Notes { get; set; }
    }
    
    public class UpdateSplitExerciseRequest
    {
        public int? Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
        public int? DefaultRestTime { get; set; }
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
    }
    
    public class ReorderSplitExercisesRequest
    {
        public List<ExerciseOrderUpdate> ExerciseOrders { get; set; } = new();
    }
    
    public class ExerciseOrderUpdate
    {
        public int SplitExerciseId { get; set; }
        public int NewOrder { get; set; }
    }
    
    public class BulkAddExercisesToSplitRequest
    {
        public List<AddExerciseToSplitRequest> Exercises { get; set; } = new();
    }
    
    // ========== RESPONSE DTOS (Output) ==========
    
    public class SplitExerciseResponse
    {
        public int Id { get; set; }
        public int SplitId { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
        public int? DefaultRestTime { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        
        // Training style recommendations
        public RecommendedRepsByStyle RecommendedReps { get; set; } = null!;
        
        // Exercise metadata
        public ExerciseMetadata ExerciseMetadata { get; set; } = null!;
    }
    
    public class SplitExerciseListResponse
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
    }
    
    public class SplitExerciseDetailResponse
    {
        public int Id { get; set; }
        public int SplitId { get; set; }
        public string SplitTag { get; set; } = string.Empty;
        public DayOfWeek SplitDay { get; set; }
        public TrainingStyle TrainingStyle { get; set; }
        public SplitExerciseResponse Exercise { get; set; } = null!;
        public List<WorkoutHistorySummary> RecentWorkouts { get; set; } = new();
        public PersonalRecordSummaryForExercise PersonalRecords { get; set; } = null!;
        public PerformanceMetrics PerformanceMetrics { get; set; } = null!;
    }
    
    public class SplitExercisePerformanceResponse
    {
        public int SplitExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public List<SplitExerciseSetVolume> SetVolumeHistory { get; set; } = new();
        public SplitExerciseRecommendations Recommendations { get; set; } = null!;
    }
    
    // ========== HELPER CLASSES ==========
    
    public class RecommendedRepsByStyle
    {
        public int PowerLiftingReps { get; set; }
        public int HypertrophyReps { get; set; }
        public int EnduranceReps { get; set; }
        public string RecommendationReason { get; set; } = string.Empty;
        
        public int GetRepsForStyle(TrainingStyle style)
        {
            return style switch
            {
                TrainingStyle.PowerLifting => PowerLiftingReps,
                TrainingStyle.Hypertrophy => HypertrophyReps,
                TrainingStyle.Endurance => EnduranceReps,
                _ => HypertrophyReps
            };
        }
    }
    
    public class ExerciseMetadata
    {
        public int DifficultyLevel { get; set; }
        public string DifficultyLevelText { get; set; } = string.Empty;
        public int EstimatedCaloriesPerSet { get; set; }
        public decimal DefaultWeightIncrement { get; set; }
        public MeasurementType MeasurementType { get; set; }
        public string MeasurementTypeText { get; set; } = string.Empty;
        public List<string> CommonMistakes { get; set; } = new();
        public List<string> FormTips { get; set; } = new();
        public string? VideoUrl { get; set; }
        public string? ImageUrl { get; set; }
    }
    
    public class WorkoutHistorySummary
    {
        public int WorkoutId { get; set; }
        public DateTime WorkoutDate { get; set; }
        public int SetsCompleted { get; set; }
        public decimal AverageWeight { get; set; }
        public int AverageReps { get; set; }
        public decimal MaxWeight { get; set; }
        public decimal TotalVolume { get; set; }
        public FormQuality AverageFormQuality { get; set; }
    }
    
    public class PersonalRecordSummaryForExercise
    {
        public decimal OneRepMax { get; set; }
        public decimal FiveRepMax { get; set; }
        public decimal TenRepMax { get; set; }
        public DateTime? LastRecordDate { get; set; }
        public int TotalRecords { get; set; }
        public decimal ImprovementOverLastMonth { get; set; }
    }
    
    public class PerformanceMetrics
    {
        public decimal EstimatedOneRepMax { get; set; }
        public decimal AverageVolumePerWorkout { get; set; }
        public decimal ConsistencyScore { get; set; } // 0-100
        public int TimesPerformed { get; set; }
        public DateTime LastPerformed { get; set; }
        public decimal StrengthRating { get; set; } // 1-10
        public string StrengthRatingText { get; set; } = string.Empty;
    }
    
    public class SplitExerciseSetVolume
    {
        public DateTime WorkoutDate { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public decimal Volume { get; set; }
        public FormQuality FormQuality { get; set; }
        public bool IsPersonalRecord { get; set; }
    }
    
    public class SplitExerciseRecommendations
    {
        public string SuggestedWeightProgression { get; set; } = string.Empty;
        public string SuggestedRepAdjustment { get; set; } = string.Empty;
        public string FormFocusPoints { get; set; } = string.Empty;
        public List<string> AlternativeExercises { get; set; } = new();
        public bool ShouldIncreaseWeight { get; set; }
        public bool ShouldDeload { get; set; }
        public string RecommendationSummary { get; set; } = string.Empty;
    }
    
    // ========== VALIDATION HELPERS ==========
    
    public static class SplitExerciseValidation
    {
        public static bool IsValidOrder(int order, int totalExercises)
        {
            return order >= 1 && order <= totalExercises;
        }
        
        public static bool IsValidDefaultSets(int? sets)
        {
            if (!sets.HasValue) return true;
            return sets.Value >= 1 && sets.Value <= 10;
        }
        
        public static bool IsValidDefaultReps(int? reps, TrainingStyle style)
        {
            if (!reps.HasValue) return true;
            
            return style switch
            {
                TrainingStyle.PowerLifting => reps.Value >= 1 && reps.Value <= 5,
                TrainingStyle.Hypertrophy => reps.Value >= 6 && reps.Value <= 12,
                TrainingStyle.Endurance => reps.Value >= 12 && reps.Value <= 20,
                _ => reps.Value >= 1 && reps.Value <= 20
            };
        }
        
        public static string GetRepRangeForStyle(TrainingStyle style)
        {
            return style switch
            {
                TrainingStyle.PowerLifting => "1-5 reps",
                TrainingStyle.Hypertrophy => "6-12 reps",
                TrainingStyle.Endurance => "12-20 reps",
                _ => "8-12 reps"
            };
        }
    }
}