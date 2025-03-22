import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { mealPlan } from "./schemas/meal";

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

// Интерфейс для параметров коррекции калорийности
interface CalorieAdjustmentParams {
  goal: "weight_loss" | "muscle_gain" | "maintenance";
  target_macros: string;
  initial_meal_plan: string;
  total_calories: number;
  breakfast_min: number;
  breakfast_max: number;
  lunch_min: number;
  lunch_max: number;
  dinner_min: number;
  dinner_max: number;
  snacks_min: number;
  snacks_max: number;
  
  // Индексная сигнатура для поддержки дополнительных полей, требуемых LangChain
  [key: string]: any;
}

// Интерфейс для ингредиента
interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// Интерфейс для блюда
interface Meal {
  name: string;
  dishType: "homemade" | "readymade";
  servingSize: number;
  ingredients: Ingredient[];
  nutrients: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
}

// Функция для округления до удобного числа
function roundToNice(value: number): number {
  if (value <= 0) return 0;
  
  // Для маленьких чисел (< 10) округляем до 0.5
  if (value < 10) return Math.round(value * 2) / 2;
  
  // Для чисел от 10 до 50 округляем до 5
  if (value < 50) return Math.round(value / 5) * 5;
  
  // Для чисел от 50 до 200 округляем до 10
  if (value < 200) return Math.round(value / 10) * 10;
  
  // Для больших чисел округляем до 25
  return Math.round(value / 25) * 25;
}

// Функция для программного пересчета калорийности блюда
function adjustMealCalories(meal: Meal, targetCalories: number): Meal {
  const currentCalories = meal.nutrients.calories;
  
  // Если текущие калории около 0, нечего масштабировать
  if (currentCalories < 10) return meal;
  
  // Коэффициент масштабирования
  const scaleFactor = targetCalories / currentCalories;
  
  // Создаем копию блюда для изменения
  const adjustedMeal: Meal = JSON.parse(JSON.stringify(meal));
  
  // Масштабируем размер порции
  adjustedMeal.servingSize = roundToNice(meal.servingSize * scaleFactor);
  
  // Масштабируем каждый ингредиент
  adjustedMeal.ingredients = meal.ingredients.map(ingredient => {
    const adjustedAmount = ingredient.amount * scaleFactor;
    return {
      ...ingredient,
      amount: roundToNice(adjustedAmount)
    };
  });
  
  // Пересчитываем нутриенты
  adjustedMeal.nutrients = {
    calories: Math.round(meal.nutrients.calories * scaleFactor),
    protein: Math.round(meal.nutrients.protein * scaleFactor * 10) / 10,
    fats: Math.round(meal.nutrients.fats * scaleFactor * 10) / 10,
    carbs: Math.round(meal.nutrients.carbs * scaleFactor * 10) / 10
  };
  
  return adjustedMeal;
}

// Функция для программной корректировки всего плана питания
function adjustMealPlan(mealPlan: any, calorieParams: CalorieParams): any {
  // Создаем копию плана
  const adjustedPlan = JSON.parse(JSON.stringify(mealPlan));
  
  // Определяем целевые калории для каждого типа приема пищи
  const targetCalories = {
    breakfast: (calorieParams.breakfastMin + calorieParams.breakfastMax) / 2,
    lunch: (calorieParams.lunchMin + calorieParams.lunchMax) / 2,
    dinner: (calorieParams.dinnerMin + calorieParams.dinnerMax) / 2,
    snack: (calorieParams.snacksMin + calorieParams.snacksMax) / 2
  };
  
  // Для каждого типа блюд
  for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
    // Для каждого блюда данного типа
    for (let i = 0; i < adjustedPlan.menu[mealType].length; i++) {
      // Генерируем немного разные целевые калории для разнообразия
      const variation = Math.random() * 0.15 - 0.075; // -7.5% до +7.5%
      const adjustedTarget = targetCalories[mealType as keyof typeof targetCalories] * (1 + variation);
      
      // Корректируем калорийность блюда
      adjustedPlan.menu[mealType][i] = adjustMealCalories(
        adjustedPlan.menu[mealType][i],
        adjustedTarget
      );
    }
  }
  
  return adjustedPlan;
}

// Новая функция для сравнения планов питания и создания человекочитаемого отчета
function compareMealPlans(initialPlan: any, adjustedPlan: any): string {
  try {
    let differences = [];
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Сравниваем общую информацию
    differences.push(`=== СРАВНЕНИЕ ПЛАНОВ ПИТАНИЯ: ДО/ПОСЛЕ КОРРЕКТИРОВКИ ===\n`);
    
    // Сравниваем блюда
    for (const mealType of mealTypes) {
      differences.push(`\n=== ${mealType.toUpperCase()} ===`);
      
      for (let i = 0; i < initialPlan.menu[mealType].length; i++) {
        const initialMeal = initialPlan.menu[mealType][i];
        const adjustedMeal = adjustedPlan.menu[mealType][i];
        
        if (!initialMeal || !adjustedMeal) continue;
        
        differences.push(`\nБлюдо: ${initialMeal.name}`);
        
        // Сравниваем размер порции
        const initialServingSize = initialMeal.servingSize || 0;
        const adjustedServingSize = adjustedMeal.servingSize || 0;
        
        if (initialServingSize !== adjustedServingSize) {
          differences.push(`Размер порции: ${initialServingSize} г → ${adjustedServingSize} г (разница: ${Math.round((adjustedServingSize - initialServingSize) * 10) / 10} г)`);
        } else {
          differences.push(`Размер порции: ${adjustedServingSize} г`);
        }
        
        differences.push(`Калории до: ${initialMeal.nutrients.calories} ккал, после: ${adjustedMeal.nutrients.calories} ккал (разница: ${Math.round((adjustedMeal.nutrients.calories - initialMeal.nutrients.calories) * 10) / 10} ккал)`);
        differences.push(`БЖУ до: ${initialMeal.nutrients.protein}/${initialMeal.nutrients.fats}/${initialMeal.nutrients.carbs} г`);
        differences.push(`БЖУ после: ${adjustedMeal.nutrients.protein}/${adjustedMeal.nutrients.fats}/${adjustedMeal.nutrients.carbs} г`);
        
        differences.push(`Ингредиенты: изменение граммовки`);
        
        // Сравниваем ингредиенты
        for (let j = 0; j < initialMeal.ingredients.length; j++) {
          if (j < initialMeal.ingredients.length && j < adjustedMeal.ingredients.length) {
            const initialIng = initialMeal.ingredients[j];
            const adjustedIng = adjustedMeal.ingredients[j];
            
            if (initialIng.name === adjustedIng.name) {
              if (initialIng.amount !== adjustedIng.amount) {
                differences.push(`  ${initialIng.name}: ${initialIng.amount} ${initialIng.unit} → ${adjustedIng.amount} ${adjustedIng.unit}`);
              }
            }
          }
        }
      }
    }
    
    return differences.join('\n');
  } catch (error) {
    console.error('Error comparing meal plans:', error);
    return 'Ошибка при сравнении планов питания';
  }
}

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-001",
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  

const prompt = PromptTemplate.fromTemplate(
    `
    Ты - опытный шеф-повар и диетолог. Составь детальный рацион питания на неделю на русском языке с рецептами, которые можно легко приготовить дома или приобрести в кафе/кулинарии.
    
Параметры:
- goal: {goal} (weight_loss = похудение, muscle_gain = набор массы, maintenance = поддержание формы)
- preferences: {preferences} (предпочтения в еде)
- allergies: {allergies} (исключенные продукты/аллергены)
- region: {region} (используй продукты, доступные в этом регионе)
- current_date: {current_date} (используй для определения сезона и сезонных продуктов)
- available_products: {available_products} (постарайся максимально использовать продукты, которые уже есть)


Требования к рациону:
1. ОБЯЗАТЕЛЬНО составь 5 вариантов завтраков
2. ОБЯЗАТЕЛЬНО составь 5 вариантов обедов
3. ОБЯЗАТЕЛЬНО составь 5 вариантов ужинов
4. ОБЯЗАТЕЛЬНО составь 5 вариантов перекусов

{user_profile_info}

ВАЖНО О НАЗВАНИЯХ ИНГРЕДИЕНТОВ:
- Для блюд домашнего приготовления используй только конкретные названия продуктов
- Вместо "овощной салат" указывай конкретные овощи: "огурец", "помидор", "перец", "лук"
- Вместо "овощное рагу" перечисляй отдельно каждый овощ: "картофель", "морковь", "лук", "перец"
- Вместо "запеченная рыба" указывай конкретный вид рыбы: "треска", "лосось", "минтай"
- Каждый ингредиент должен быть конкретным, сырым (не приготовленным) продуктом

ВАЖНО О РЕЦЕПТАХ И ИНГРЕДИЕНТАХ:
- Каждое блюдо должно иметь конкретное, понятное название (например, "Овсяная каша с медом и яблоками")
- Для каждого блюда указывай детальный список ингредиентов с точным количеством и единицами измерения
- Используй стандартные единицы измерения: г, мл, шт, ст.л., ч.л.
- Приоритетно используй продукты, которые уже есть в наличии у пользователя
- Учитывай сезонность продуктов на основе текущей даты
- Блюда должны быть разнообразными по составу и способу приготовления

Для КАЖДОГО блюда указывай:
- Название блюда
- Тип блюда (dishType): "homemade" для домашних или "readymade" для готовых из кафе/кулинарии
- Список ингредиентов с полями: название продукта, количество (число), единица измерения
- Нутриентный состав: калории, белки, жиры, углеводы (числовые значения в граммах)
- ОБЯЗАТЕЛЬНО для каждого блюда укажи размер готовой порции в граммах!

ПРИМЕРЫ ПРАВИЛЬНЫХ ИНГРЕДИЕНТОВ:
- "огурец свежий", "помидор", "куриное филе", "лосось", "картофель", "молоко 2,5%", "йогурт натуральный", "масло оливковое"

ОЧЕНЬ ВАЖНО: Составь ТОЧНО 5 БЛЮД В КАЖДОЙ КАТЕГОРИИ (завтраки, обеды, ужины, перекусы).
В КАЖДОЙ категории должно быть НЕ МЕНЕЕ 2 ГОТОВЫХ БЛЮД (dishType = "readymade").

ВАЖНО: ДЛЯ КАЖДОГО БЛЮДА ОБЯЗАТЕЛЬНО УКАЖИ РАЗМЕР ГОТОВОЙ ПОРЦИИ В ГРАММАХ!
    `
  );

// Первый этап: создание исходного плана питания
const initialMealPlanChain = prompt.pipe(llm.withStructuredOutput(mealPlan));

// Полная цепочка обработки с типизированными параметрами
export async function generateMealPlan(params: MealPlanParams): Promise<any> {
  // Первый этап: создание исходного плана питания
  const initialPlan = await initialMealPlanChain.invoke(params);
  
  // Добавляем метаданные о калорийности для справки
  console.log(`\n=== ИНФОРМАЦИЯ О ЦЕЛЕВОЙ КАЛОРИЙНОСТИ ===`);
  console.log(`Цель: ${params.goal}`);
  console.log(`Целевые калории: ${params.target_daily_calories?.targetCalories || 2000} ккал`);
  console.log(`Завтрак: ${params.target_daily_calories?.breakfastMin || 500}-${params.target_daily_calories?.breakfastMax || 600} ккал`);
  console.log(`Обед: ${params.target_daily_calories?.lunchMin || 700}-${params.target_daily_calories?.lunchMax || 800} ккал`);
  console.log(`Ужин: ${params.target_daily_calories?.dinnerMin || 400}-${params.target_daily_calories?.dinnerMax || 500} ккал`);
  console.log(`Перекусы: ${params.target_daily_calories?.snacksMin || 200}-${params.target_daily_calories?.snacksMax || 300} ккал\n`);
  
  // Получаем параметры калорийности или используем значения по умолчанию
  const calorieParams: CalorieParams = {
    targetCalories: params.target_daily_calories?.targetCalories || 2000,
    breakfastMin: params.target_daily_calories?.breakfastMin || 500,
    breakfastMax: params.target_daily_calories?.breakfastMax || 600,
    lunchMin: params.target_daily_calories?.lunchMin || 700,
    lunchMax: params.target_daily_calories?.lunchMax || 800,
    dinnerMin: params.target_daily_calories?.dinnerMin || 400,
    dinnerMax: params.target_daily_calories?.dinnerMax || 500,
    snacksMin: params.target_daily_calories?.snacksMin || 200,
    snacksMax: params.target_daily_calories?.snacksMax || 300
  };
  
  // Второй этап: программная коррекция калорийности вместо использования LLM
  console.log(`Пересчитываем калорийность блюд для соответствия целевым показателям...`);
  const adjustedPlan = adjustMealPlan(initialPlan, calorieParams);
  
  // Сравниваем планы и выводим различия в консоль
  const planDifferences = compareMealPlans(initialPlan, adjustedPlan);
  console.log(planDifferences);
  
  // Возвращаем скорректированный план
  return adjustedPlan;
}

// Обратная совместимость со старым интерфейсом
export const chain = initialMealPlanChain;

  

