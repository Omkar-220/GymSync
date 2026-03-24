using GymTracker.Core.Enums;

namespace GymTracker.Core.DTOs
{

    
    public class CreatePersonalRecordRequest
    {
        public int UserId { get; set; }
        public int ExerciseId { get; set; }
        public PRType Type { get; set; }
        public decimal Value { get; set; }
        public int Reps { get; set; }
        public int WorkoutSetId { get; set; }
    }
    

    
    public class PersonalRecordResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public PRType Type { get; set; }
        public string TypeDisplayName { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public int Reps { get; set; }
        public DateTime AchievedAt { get; set; }
        public int WorkoutId { get; set; }
        public DateTime WorkoutDate { get; set; }
        public decimal? PreviousRecord { get; set; }
        public decimal? Improvement { get; set; }
    }
    
    public class PersonalRecordListResponse
    {
        public int Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public PRType Type { get; set; }
        public string TypeDisplayName { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public int Reps { get; set; }
        public DateTime AchievedAt { get; set; }
    }
    
   
    public static class PRTypeExtensions
    {
        public static string GetDisplayName(this PRType type)
        {
            return type switch
            {
                PRType.OneRepMax => "1 Rep Max",
                PRType.ThreeRepMax => "3 Rep Max",
                PRType.FiveRepMax => "5 Rep Max",
                PRType.TenRepMax => "10 Rep Max",
                PRType.TotalVolume => "Total Volume",
                PRType.MaxWeight => "Max Weight",
                PRType.MaxRepsAtWeight => "Max Reps",
                PRType.EstimatedOneRepMax => "Est. 1RM",
                _ => type.ToString()
            };
        }
    }
}