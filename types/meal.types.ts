import { z } from 'zod';
import { Meal } from './base.types';

// Тип для меню на день
export interface DailyMenu {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

// Zod схемы
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

export const nutrientsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number(),
});

export const mealSchema = z.object({
  name: z.string(),
  dishType: z.enum(['homemade', 'readymade']),
  ingredients: z.array(ingredientSchema),
  nutrients: nutrientsSchema,
  servingSize: z.number(),
});
