import React from 'react';
import MealCard from './MealCard';
import { Meal, MealType } from '@/types';

interface MealCategoryProps {
  title: string;
  icon: React.ReactNode;
  meals: Meal[];
  mealType: MealType;
  mealPlanId: string;
}

export default function MealCategory({ title, icon, meals, mealType, mealPlanId }: MealCategoryProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals?.map((meal, index) => (
          <MealCard
            key={`${meal.name}-${index}`}
            meal={meal}
            mealType={mealType}
            mealPlanId={mealPlanId}
            mealIndex={index}
            onMealUpdated={(meal) => {
              console.log(meal);
            }}
          />
        ))}
      </div>
    </div>
  );
} 