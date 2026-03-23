using Microsoft.EntityFrameworkCore;
using GymTracker.Core.Entities;

namespace GymTracker.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Split> Splits { get; set; }
        public DbSet<SplitExercise> SplitExercises { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<WorkoutSet> WorkoutSets { get; set; }
        public DbSet<NutritionLog> NutritionLogs { get; set; }
        public DbSet<PersonalRecord> PersonalRecords { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Fix decimal precision warnings
            modelBuilder.Entity<Exercise>()
                .Property(e => e.DefaultWeightIncrement)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Protein)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Carbs)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Fats)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Zinc)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Calories)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<PersonalRecord>()
                .Property(p => p.Value)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<WorkoutSet>()
                .Property(w => w.Weight)
                .HasPrecision(18, 2);
            
            // Configure relationships with NO ACTION to avoid cascade cycles
            modelBuilder.Entity<Split>()
                .HasOne(s => s.User)
                .WithMany(u => u.Splits)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            modelBuilder.Entity<SplitExercise>()
                .HasOne(se => se.Split)
                .WithMany(s => s.SplitExercises)
                .HasForeignKey(se => se.SplitId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<SplitExercise>()
                .HasOne(se => se.Exercise)
                .WithMany(e => e.SplitExercises)
                .HasForeignKey(se => se.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.User)
                .WithMany(u => u.Workouts)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.Split)
                .WithMany()
                .HasForeignKey(w => w.SplitId)
                .OnDelete(DeleteBehavior.SetNull);
            
            modelBuilder.Entity<WorkoutSet>()
                .HasOne(ws => ws.Workout)
                .WithMany(w => w.WorkoutSets)
                .HasForeignKey(ws => ws.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<WorkoutSet>()
                .HasOne(ws => ws.Exercise)
                .WithMany(e => e.WorkoutSets)
                .HasForeignKey(ws => ws.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<NutritionLog>()
                .HasOne(n => n.User)
                .WithMany(u => u.NutritionLogs)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.User)
                .WithMany()
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.Exercise)
                .WithMany(e => e.PersonalRecords)
                .HasForeignKey(pr => pr.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.WorkoutSet)
                .WithMany()
                .HasForeignKey(pr => pr.WorkoutSetId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Indexes for performance
            modelBuilder.Entity<Exercise>()
                .HasIndex(e => e.Name)
                .IsUnique();
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            // Configure table names and constraints
            modelBuilder.Entity<WorkoutSet>()
                .HasIndex(ws => new { ws.WorkoutId, ws.ExerciseId, ws.SetNumber })
                .IsUnique();
        }
    }
}