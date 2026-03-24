using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{
    public class CreateExerciseRequest
    {
        public string Name { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public int DifficultyLevel { get; set; } = 1;
        public int EstimatedCaloriesPerSet { get; set; }
        public MeasurementType MeasurementType { get; set; }
    }
    
    public class UpdateExerciseRequest
    {
        public string? Name { get; set; }
        public string? MuscleGroup { get; set; }
        public string? Equipment { get; set; }
        public bool? IsActive { get; set; }
        public int? DifficultyLevel { get; set; }
    }
    
    public class ExerciseResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int DifficultyLevel { get; set; }
        public int EstimatedCaloriesPerSet { get; set; }
        public MeasurementType MeasurementType { get; set; }
    }
    
    public class ExerciseListResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public int DifficultyLevel { get; set; }
    }
}