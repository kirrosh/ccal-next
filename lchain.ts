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

ПРИМЕРЫ ПРАВИЛЬНЫХ ИНГРЕДИЕНТОВ:
- "огурец свежий", "помидор", "куриное филе", "лосось", "картофель", "молоко 2,5%", "йогурт натуральный", "масло оливковое"

ОЧЕНЬ ВАЖНО: Составь ТОЧНО 5 БЛЮД В КАЖДОЙ КАТЕГОРИИ (завтраки, обеды, ужины, перекусы).
В КАЖДОЙ категории должно быть НЕ МЕНЕЕ 2 ГОТОВЫХ БЛЮД (dishType = "readymade").
    `
  );

// Первый этап: создание исходного плана питания
const initialMealPlanChain = prompt.pipe(llm.withStructuredOutput(mealPlan));

// Второй этап: шаблон для коррекции граммовки под требуемую калорийность
const calorieAdjustmentPrompt = PromptTemplate.fromTemplate(`
Ты - опытный диетолог, специализирующийся на точной калькуляции питания. 
Тебе дан подробный план питания на неделю. Твоя задача - скорректировать граммовку ингредиентов, 
чтобы общая калорийность соответствовала целям пользователя.

Цель пользователя: {goal}

ТРЕБУЕМАЯ ДНЕВНАЯ КАЛОРИЙНОСТЬ И РАСПРЕДЕЛЕНИЕ ПО ПРИЕМАМ ПИЩИ:
- Общая суточная калорийность: {total_calories} ккал
- Завтрак: {breakfast_min}-{breakfast_max} ккал
- Обед: {lunch_min}-{lunch_max} ккал
- Ужин: {dinner_min}-{dinner_max} ккал
- Перекусы: {snacks_min}-{snacks_max} ккал

Требуемое соотношение БЖУ (белки/жиры/углеводы): {target_macros}

ИСХОДНЫЙ ПЛАН ПИТАНИЯ:
{initial_meal_plan}

ИНСТРУКЦИИ:
1. Сохрани все блюда без изменения их состава и названий
2. Пропорционально измени количество (граммовку) ингредиентов, чтобы достичь целевых показателей калорийности
3. Обнови нутриентный состав (калории, белки, жиры, углеводы) в соответствии с новыми порциями
4. Точно соблюдай следующие целевые диапазоны калорийности:
   - Завтрак: {breakfast_min}-{breakfast_max} ккал
   - Обед: {lunch_min}-{lunch_max} ккал
   - Ужин: {dinner_min}-{dinner_max} ккал
   - Перекусы: {snacks_min}-{snacks_max} ккал
5. Убедись, что соотношение БЖУ соответствует целям пользователя

РЕЗУЛЬТАТ:
Верни полный план питания с обновленной граммовкой и нутриентным составом, сохраняя структуру исходного плана.
`);

// Второй этап: коррекция граммовки
const calorieAdjustmentChain = calorieAdjustmentPrompt.pipe(llm.withStructuredOutput(mealPlan));

// Полная цепочка обработки с типизированными параметрами
export async function generateMealPlan(params: MealPlanParams): Promise<any> {
  // Первый этап: создание исходного плана питания
  const initialPlan = await initialMealPlanChain.invoke(params);
  
  // Второй этап: коррекция граммовки
  const adjustmentParams: CalorieAdjustmentParams = {
    goal: params.goal,
    target_macros: params.target_macros || "Белки: 30%, Жиры: 30%, Углеводы: 40%", // Значение по умолчанию
    initial_meal_plan: JSON.stringify(initialPlan, null, 2),
    
    // Извлечение значений калорийности из объекта target_daily_calories или использование значений по умолчанию
    total_calories: params.target_daily_calories?.targetCalories || 2000,
    breakfast_min: params.target_daily_calories?.breakfastMin || 500,
    breakfast_max: params.target_daily_calories?.breakfastMax || 600,
    lunch_min: params.target_daily_calories?.lunchMin || 700,
    lunch_max: params.target_daily_calories?.lunchMax || 800,
    dinner_min: params.target_daily_calories?.dinnerMin || 400,
    dinner_max: params.target_daily_calories?.dinnerMax || 500,
    snacks_min: params.target_daily_calories?.snacksMin || 200,
    snacks_max: params.target_daily_calories?.snacksMax || 300
  };
  
  const adjustedPlan = await calorieAdjustmentChain.invoke(adjustmentParams);
  
  return adjustedPlan;
}

// Обратная совместимость со старым интерфейсом
export const chain = initialMealPlanChain;

  

