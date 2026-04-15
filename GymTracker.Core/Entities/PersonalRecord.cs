using GymTracker.Core.Enums; 

namespace GymTracker.Core.Entities
{
    public class PersonalRecord
    {
        
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ExerciseId { get; set; }
        public PRType Type { get; set; }
        public decimal Value { get; set; }
        public int Reps { get; set; }
        public DateTime AchievedAt { get; set; } = DateTime.UtcNow;
        public int? WorkoutSetId { get; set; }
        public decimal? PreviousRecord { get; set; }
        public User User { get; set; } = null!;
        public Exercise Exercise { get; set; } = null!;
        public WorkoutSet? WorkoutSet { get; set; }


    }
    
    
}