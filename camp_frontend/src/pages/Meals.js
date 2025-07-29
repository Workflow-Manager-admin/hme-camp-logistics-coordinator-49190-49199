import React from 'react';
import MealPlanner from '../components/MealPlanner/MealPlanner';

// PUBLIC_INTERFACE
/**
 * Meals page component for coordinating communal meals and food planning.
 * Handles meal signups, dietary preferences, and cooking assignments.
 */
const Meals = () => {
  return (
    <div className="page-container">
      <MealPlanner />
    </div>
  );
};

export default Meals;
