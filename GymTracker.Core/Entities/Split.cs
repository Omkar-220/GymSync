using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class Split
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public string Tag { get; set; } = string.Empty;
        public TrainingStyle TrainingStyle { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<SplitExercise> SplitExercises { get; set; } = new List<SplitExercise>();
    }
}