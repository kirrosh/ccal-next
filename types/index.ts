export * from './meal.types';
export * from './user.types';
export * from './weekly.types';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Nutrients {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface Meal {
  id?: string;
  name: string;
  dishType: 'homemade' | 'readymade';
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
}

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  daily_calories?: number;
  target_daily_calories?: {
    breakfastMin: number;
    breakfastMax: number;
    lunchMin: number;
    lunchMax: number;
    dinnerMin: number;
    dinnerMax: number;
    snacksMin: number;
    snacksMax: number;
  };
}

export const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}; 