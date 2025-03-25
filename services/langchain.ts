import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { generateMealPlanPrompt } from '@/prompts/generateMealPlan';
import { regenerateMealPrompt } from '@/prompts/regenerateMeal';
import { mealPlanSchemaInline, mealSchema } from '@/schemas/meal';

// Интерфейс для начальных параметров функции generateMealPlan
interface MealPlanParams {
  // Основные параметры
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
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
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  preferences: string[];
  allergies: string[];
  region: string;
  current_date: string;
  user_profile_info: string;
  minCalories: number;
  maxCalories: number;
  previousMeal: string;
  // Индексная сигнатура для поддержки дополнительных полей, требуемых LangChain
  [key: string]: any;
}

// Create LLM only if API key is available
const llm = process.env.GOOGLE_API_KEY 
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash-001',
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
      apiKey: process.env.GOOGLE_API_KEY,
    })
  : null;

// Create chains only if LLM is available
const mealPlanChain = llm ? generateMealPlanPrompt.pipe(llm.withStructuredOutput(mealPlanSchemaInline)) : null;
const regenerateMealChain = llm ? regenerateMealPrompt.pipe(llm.withStructuredOutput(mealSchema)) : null;

// Функция генерации полного плана питания
export async function generateMealPlan(params: MealPlanParams): Promise<any> {
  if (!llm || !mealPlanChain) {
    console.warn('Google API key not available. Returning mock data.');
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
  }

  console.log(`\n=== НАЧАЛО ГЕНЕРАЦИИ ПЛАНА ПИТАНИЯ ===`);
  console.log(`Цель: ${params.goal}`);

  const initialPlan = await mealPlanChain.invoke(params);

  console.log(`\n=== ЗАВЕРШЕНИЕ ГЕНЕРАЦИИ ПЛАНА ПИТАНИЯ ===`);
  return initialPlan;
}

// Функция регенерации одного блюда
export async function regenerateMeal(params: RegenerateMealParams): Promise<any> {
  if (!llm || !regenerateMealChain) {
    console.warn('Google API key not available. Returning mock data.');
    return {
      name: 'Mock Meal',
      dishType: 'homemade',
      ingredients: [],
      nutrients: {
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0
      },
      servingSize: 1
    };
  }

  console.log(`\n=== НАЧАЛО РЕГЕНЕРАЦИИ БЛЮДА ===`);
  console.log(`Тип приема пищи: ${params.mealType}`);

  const newMeal = await regenerateMealChain.invoke(params);
  console.log('New meal:', newMeal);
  console.log(`\n=== ЗАВЕРШЕНИЕ РЕГЕНЕРАЦИИ БЛЮДА ===`);
  return newMeal;
}
