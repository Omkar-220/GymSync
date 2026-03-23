namespace GymTracker.Core.Entities
{
    public class Workout
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime WorkoutDate { get; set; } = DateTime.UtcNow;
        public int? SplitId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        
        public User User { get; set; } = null!;
        public Split Split { get; set; } = null!;
        public ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
    }
}