namespace GymTracker.Core.Entities
{
    public class SplitExercise
    {
        public int Id { get; set; }
        public int SplitId { get; set; }
        public int ExerciseId { get; set; }
        public int Order { get; set; }
        public int? DefaultSets { get; set; }
        
        
        public Split Split { get; set; } = null!;
        public Exercise Exercise { get; set; } = null!;
        
    }
}