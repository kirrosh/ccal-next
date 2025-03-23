import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { generateMealPlanPrompt } from "@/prompts/generateMealPlan";
import { regenerateMealPrompt } from "@/prompts/regenerateMeal";
import { mealPlan, meal } from "@/schemas/meal";

// Интерфейс для начальных параметров функции generateMealPlan
interface MealPlanParams {
  // Основные параметры
  goal: "weight_loss" | "muscle_gain" | "maintenance";
  preferences: string[];
  allergies: string[];
  region: string;
  current_date: string;
  available_products: string[];
  user_profile_info: string;
  
  // Опциональные параметры
  target_macros?: string;
  target_daily_calories?: CalorieParams;
  
  // Индексная сигнатура для поддержки дополнительных полей, требуемых LangChain
  [key: string]: any;
}

// Интерфейс для параметров калорийности
interface CalorieParams {
  targetCalories: number;
  breakfastMin: number;
  breakfastMax: number;
  lunchMin: number;
  lunchMax: number;
  dinnerMin: number;
  dinnerMax: number;
  snacksMin: number;
  snacksMax: number;
}

// Интерфейс для параметров регенерации одного блюда
interface RegenerateMealParams {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  preferences: string[];
  allergies: string[];
  region: string;
  current_date: string;
  user_profile_info: string;
  minCalories: number;
  maxCalories: number;
  
  // Индексная сигнатура для поддержки дополнительных полей, требуемых LangChain
  [key: string]: any;
}

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-001",
  maxOutputTokens: 8192,
  temperature: 0.7,
  topP: 0.95,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Цепочка для генерации полного плана питания
const mealPlanChain = generateMealPlanPrompt.pipe(llm.withStructuredOutput(mealPlan));

// Цепочка для регенерации одного блюда
const regenerateMealChain = regenerateMealPrompt.pipe(llm.withStructuredOutput(meal));

// Функция генерации полного плана питания
export async function generateMealPlan(params: MealPlanParams): Promise<any> {
  console.log(`\n=== НАЧАЛО ГЕНЕРАЦИИ ПЛАНА ПИТАНИЯ ===`);
  console.log(`Цель: ${params.goal}`);
  
  const initialPlan = await mealPlanChain.invoke(params);
  
  console.log(`\n=== ЗАВЕРШЕНИЕ ГЕНЕРАЦИИ ПЛАНА ПИТАНИЯ ===`);
  return initialPlan;
}

// Функция регенерации одного блюда
export async function regenerateMeal(params: RegenerateMealParams): Promise<any> {
  console.log(`\n=== НАЧАЛО РЕГЕНЕРАЦИИ БЛЮДА ===`);
  console.log(`Тип приема пищи: ${params.mealType}`);
  
  const newMeal = await regenerateMealChain.invoke(params);
  
  console.log(`\n=== ЗАВЕРШЕНИЕ РЕГЕНЕРАЦИИ БЛЮДА ===`);
  return newMeal;
} 