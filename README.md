# GymSync

## Workout Progress Tracking API

A RESTful API built with .NET 9 and Entity Framework Core for tracking gym workouts, exercises, splits, and nutrition. Designed for fitness applications requiring structured workout logging and progress monitoring.

## Features

- **Exercise Management** - Create and manage exercise library with muscle group categorization
- **Split Configuration** - Configure weekly workout splits with custom tags (Push, Pull, Legs, etc.)
- **Training Styles** - Support for Power Lifting, Hypertrophy, and Endurance with recommended rep ranges
- **Workout Logging** - Track sets with weight, reps, form quality, and perceived exertion
- **Progress Tracking** - Monitor personal records, volume, and strength progression
- **Nutrition Logging** - Track protein, carbs, fats, zinc, and calorie intake
- **Performance Analytics** - Calculate one-rep max, total volume, and consistency metrics

## Tech Stack

- .NET 9
- Entity Framework Core
- SQL Server
- Swagger/OpenAPI

## Architecture

| Project | Description |
|---------|-------------|
| **GymSync.API** | Controllers and API endpoints |
| **GymSync.Core** | Domain models, DTOs, and interfaces |
| **GymSync.Infrastructure** | Database context and migrations |

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- SQL Server or SQL Server LocalDB

