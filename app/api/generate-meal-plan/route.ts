import { generateMealPlan } from '@/lchain';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      goal, 
      preferences, 
      allergies, 
      region, 
      available_products,
      user_profile // User profile data
    } = body;

    // Parameters for the LLM chain
    const chainParams: any = {
      goal,
      preferences,
      allergies,
      region,
      current_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      available_products,
      user_profile_info: '' // Initialize empty string
    };

    // Add user profile data if available
    if (user_profile) {
      // Format user profile information for the prompt
      const gender = user_profile.gender === 'male' ? 'мужской' : 'женский';
      const activityLabels: Record<string, string> = {
        sedentary: 'малоподвижный образ жизни',
        light: 'легкая активность (1-3 раза в неделю)',
        moderate: 'умеренная активность (3-5 раз в неделю)',
        active: 'высокая активность (6-7 раз в неделю)',
        very_active: 'очень высокая активность'
      };

          // Calculate target calories based on goal
    let targetCalories = user_profile.daily_calories; // Default: maintenance
    let goalDescription = '';
    
    if (goal === 'weight_loss') {
      targetCalories = Math.round(user_profile.daily_calories * 0.85);
      goalDescription = 'Похудение (-15% от суточной потребности)';
    } else if (goal === 'muscle_gain') {
      targetCalories = Math.round(user_profile.daily_calories * 1.15);
      goalDescription = 'Набор массы (+15% от суточной потребности)';
    } else if (goal === 'maintenance') {
      goalDescription = 'Поддержание формы (равно суточной потребности)';
    }
          // Calculate meal-specific calories
    const breakfastMin = Math.round(targetCalories * 0.25);
    const breakfastMax = Math.round(targetCalories * 0.30);
    
    const lunchMin = Math.round(targetCalories * 0.35);
    const lunchMax = Math.round(targetCalories * 0.40);
    
    const dinnerMin = Math.round(targetCalories * 0.20);
    const dinnerMax = Math.round(targetCalories * 0.25);
    
    const snacksMin = Math.round(targetCalories * 0.10);
    const snacksMax = Math.round(targetCalories * 0.15);
    chainParams.target_daily_calories = {
      targetCalories,
      breakfastMin,
      breakfastMax,
      lunchMin,
      lunchMax,
      dinnerMin,
      dinnerMax,
      snacksMin,
      snacksMax
    }
      
      // Create a formatted string with user profile information
      chainParams.user_profile_info = `
- user_profile: Информация о пользователе:
  * Пол: ${gender}
  * Возраст: ${user_profile.age} лет
  * Рост: ${user_profile.height} см
  * Вес: ${user_profile.weight} кг
  * Уровень активности: ${activityLabels[user_profile.activityLevel] || user_profile.activityLevel}
  * Суточная потребность в калориях: ${user_profile.daily_calories} ккал

КАЛОРИЙНОСТЬ РАЦИОНА ДЛЯ ТЕКУЩЕЙ ЦЕЛИ ПОЛЬЗОВАТЕЛЯ:

Суточная калорийность для достижения цели: ${targetCalories} ккал

РАСПРЕДЕЛЕНИЕ КАЛОРИЙ ПО ПРИЕМАМ ПИЩИ:
- Завтрак: ${breakfastMin}-${breakfastMax} ккал 
- Обед: ${lunchMin}-${lunchMax} ккал 
- Ужин: ${dinnerMin}-${dinnerMax} ккал
- Перекусы: ${snacksMin}-${snacksMax} ккал 
Текущая цель: "${goalDescription}

УЧИТЫВАЙ УКАЗАННУЮ КАЛОРИЙНОСТЬ ПРИ СОСТАВЛЕНИИ РАЦИОНА:
1. Старайся, чтобы общая калорийность дневного рациона соответствовала целевому значению в ${
  goal === 'weight_loss' 
    ? Math.round(user_profile.daily_calories * 0.85) 
    : goal === 'muscle_gain' 
      ? Math.round(user_profile.daily_calories * 1.15) 
      : user_profile.daily_calories
} ккал.
2. Для каждого блюда указывай его калорийность и старайся, чтобы суммарно приемы пищи соответствовали указанным диапазонам.
3. Выбирай продукты и способы приготовления, подходящие для цели "${goal}".

Обязательно учитывай эти данные при составлении блюд и их калорийности!
`;
    }

    const mealPlan = await generateMealPlan(chainParams)

    const mealPlanWithId = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...mealPlan
    };

    return NextResponse.json(mealPlanWithId);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
} 