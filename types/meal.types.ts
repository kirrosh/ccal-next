import { z } from "zod";
import { mealPlanSchema } from '@/schemas/meal';

// Базовые типы
export type DishType = "homemade" | "readymade";
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type Goal = "weight_loss" | "muscle_gain" | "maintenance";

// Типы для ингредиентов и нутриентов
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

// Тип для одного блюда
export interface Meal {
  name: string;
  dishType: DishType;
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
}

// Тип для меню на день
export interface DailyMenu {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

// Тип для плана питания
export type MealPlan = z.infer<typeof mealPlanSchema>;

// Zod схемы
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string()
});

export const nutrientsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number()
});

export const mealSchema = z.object({
  name: z.string(),
  dishType: z.enum(["homemade", "readymade"]),
  ingredients: z.array(ingredientSchema),
  nutrients: nutrientsSchema,
  servingSize: z.number()
}); 