import { MealPlan, Meal } from './meal.types';

export interface WeeklyPlan {
  id: string;
  userId: string;
  mealPlanId: string;  // ID связанного плана питания
  startDate: string;
  endDate: string;
  days: Record<string, {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  }>;
  mealPlans: MealPlan[];
  createdAt: string;
  updatedAt: string;
} 