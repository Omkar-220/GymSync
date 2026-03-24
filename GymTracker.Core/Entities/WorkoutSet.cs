using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class WorkoutSet
    {
        public int Id { get; set; }
        public int WorkoutId { get; set; }
        public int ExerciseId { get; set; }
        public int SetNumber { get; set; }
        public decimal Weight { get; set; }
        public int Reps { get; set; }
        public bool IsCompleted { get; set; } = true;
        public FormQuality FormQuality { get; set; } = FormQuality.Good;
        public int? FatigueLevel { get; set; }
        public SetQuality Quality { get; set; } = SetQuality.Good;
        public int? RepsInReserve { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public int? PerceivedExertion { get; set; }
        
        
        public Workout Workout { get; set; } = null!;
        public Exercise Exercise { get; set; } = null!;
        public PersonalRecord? PersonalRecord { get; set; } 
        public int? PersonalRecordId { get; set; } 
        public User User { get; set; } = null!;
        public int? PersonalRecordId { get; set; }  


    }
}