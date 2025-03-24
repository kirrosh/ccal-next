import { MealType, Meal } from './base.types';

export interface WeeklyPlan {
  id: string;
  userId: string;
  mealPlanId: string;  // ID связанного плана питания
  startDate: string;
  endDate: string;
  days: Record<string, Record<MealType, Meal>>;
  createdAt: string;
  updatedAt: string;
  v: number;
} 