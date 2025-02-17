// utils/pointSystem.js

export const calculatePoints = (message, category) => {
    let basePoints = 10; // base points for any debate
  
    // Adjust points based on category
    switch (category) {
      case "beginner":
        basePoints *= 1; // no multiplier for beginner
        break;
      case "intermediate":
        basePoints *= 2; // intermediate level gets double points
        break;
      case "advanced":
        basePoints *= 3; // advanced level gets triple points
        break;
      default:
        basePoints = 0;
    }
  
    // You can add additional logic to calculate points based on the question and answer quality
    return basePoints;
  };
  