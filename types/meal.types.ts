import { z } from "zod";

// Базовые типы
export type DishType = "homemade" | "readymade";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
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
  snack: Meal[];
}

// Тип для плана питания
export interface MealPlan {
  id: string;
  userId: string;
  goal: Goal;
  preferences: string[];
  allergies: string[];
  availableProducts: string[];
  currentDate: string;
  createdAt: string;
  menu: DailyMenu;
}

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

export const mealPlanSchema = z.object({
  id: z.string().optional(),
  userId: z.string().describe("ID пользователя"),
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance"]).describe("Цель питания (похудение, набор массы, поддержание)"),
  preferences: z.array(z.string()).describe("Предпочтения в еде"),
  allergies: z.array(z.string()).describe("Аллергены/исключения"),
  availableProducts: z.array(z.string()).describe("Продукты, которые уже есть в наличии"),
  currentDate: z.string().describe("Текущая дата для определения сезонных продуктов"),
  createdAt: z.string().describe("Дата создания плана питания"),
  menu: z.object({
    breakfast: z.array(mealSchema).length(5).describe("Список из 5 завтраков на неделю"),
    lunch: z.array(mealSchema).length(5).describe("Список из 5 обедов на неделю"),
    dinner: z.array(mealSchema).length(5).describe("Список из 5 ужинов на неделю"),
    snack: z.array(mealSchema).length(5).describe("Список из 5 перекусов на неделю"),
  }).describe("Меню на неделю"),
}); 