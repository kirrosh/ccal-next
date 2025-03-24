import { MealType, Meal } from './base.types';

export interface WeeklyPlan {
  id: string;
  userId: string;
  mealPlanId: string; // ID связанного плана питания
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
