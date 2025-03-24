export * from './base.types';
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
  dishType: 'homemade' | 'readymade' | string;
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
}

export interface MealPlan {
  id: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  preferences?: string[];
  allergies?: string[];
  menu: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
}

export interface UserProfile {
  id: string;
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

export interface WeeklyPlan {
  id: string;
  userId: string;
  mealPlanId: string;
  startDate: string;
  endDate: string;
  days: Array<{
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  }>;
  createdAt: string;
  updatedAt: string;
  v: number;
}
