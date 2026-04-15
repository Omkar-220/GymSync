using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{
   
    
    public class CreateSplitRequest
    {
        public int UserId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public string Tag { get; set; } = string.Empty;
        public TrainingStyle TrainingStyle { get; set; }
    }
    
    public class UpdateSplitRequest
    {
        public string? Tag { get; set; }
        public TrainingStyle? TrainingStyle { get; set; }
        public bool? IsActive { get; set; }
    }
    
   
    
    public class AddExerciseToSplitRequest
    {
        public int ExerciseId { get; set; }
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
    }
    
    public class UpdateSplitExerciseRequest
    {
        public int? Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
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
    
    
    
    public class SplitResponse
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public string Tag { get; set; } = string.Empty;
        public TrainingStyle TrainingStyle { get; set; }
        public bool IsActive { get; set; }
        public List<SplitExerciseResponse> Exercises { get; set; } = new();
    }
    
    public class SplitExerciseResponse
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        public int? DefaultReps { get; set; }
    }
}