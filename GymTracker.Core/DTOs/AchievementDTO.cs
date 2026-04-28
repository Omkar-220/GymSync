namespace GymTracker.Core.DTOs
{
    public class AchievementResponse
    {
        public string Key { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconHint { get; set; } = string.Empty;   // e.g. "medal", "flame", "shield"
        public DateTime AchievedAt { get; set; }
    }
}
