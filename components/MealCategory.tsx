import React from 'react';
import MealCard from './MealCard';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Nutrients {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface Meal {
  name: string;
  dishType: "homemade" | "readymade";
  ingredients: Ingredient[];
  nutrients: Nutrients;
}

interface MealCategoryProps {
  title: string;
  icon: React.ReactNode;
  meals: Meal[];
}

const MealCategory: React.FC<MealCategoryProps> = ({ 
  title, 
  icon, 
  meals 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-primary">{icon}</div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal, index) => (
          <MealCard
            key={index}
            name={meal.name}
            dishType={meal.dishType}
            ingredients={meal.ingredients}
            nutrients={meal.nutrients}
          />
        ))}
      </div>
    </div>
  );
};

export default MealCategory; 