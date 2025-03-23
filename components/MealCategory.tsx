import React from 'react';
import MealCard from './MealCard';
import { MealPlan} from '@/schemas/meal';
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
  servingSize: number;
  ingredients: Ingredient[];
  nutrients: Nutrients;
}



interface MealCategoryProps {
  title: string;
  icon: React.ReactNode;
  meals: Meal[];
  mealPlan: MealPlan;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const MealCategory: React.FC<MealCategoryProps> = ({ 
  title, 
  icon, 
  meals,
  mealPlan,
  mealType,
  // userProfile,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-primary">{icon}</div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {meals.map((meal, index) => (
          <MealCard
            key={index}
            meal={meal}
            mealType={mealType}
            // userProfile={userProfile}
            onMealUpdated={(meal) => {
              console.log(meal);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MealCategory; 