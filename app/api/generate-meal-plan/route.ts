import { generateMealPlan } from '@/lchain';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Получен запрос на генерацию плана питания ===');
    
    const body = await request.json();
    const { 
      goal, 
      preferences, 
      allergies, 
      region, 
      available_products,
      user_profile // User profile data
    } = body;

    console.log(`Цель: ${goal}`);
    console.log(`Предпочтения: ${preferences?.join(', ')}`);
    console.log(`Аллергии: ${allergies?.join(', ')}`);
    console.log(`Регион: ${region}`);
    
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
      console.log('=== Данные профиля пользователя ===');
      console.log(`Пол: ${user_profile.gender}`);
      console.log(`Возраст: ${user_profile.age}`);
      console.log(`Рост: ${user_profile.height} см`);
      console.log(`Вес: ${user_profile.weight} кг`);
      console.log(`Уровень активности: ${user_profile.activityLevel}`);
      console.log(`Суточная потребность в калориях: ${user_profile.daily_calories} ккал`);
      
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
      
      console.log(`Целевая калорийность для ${goalDescription}: ${targetCalories} ккал`);
      
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
      
      console.log('=== Распределение калорий по приемам пищи ===');
      console.log(`Завтрак: ${breakfastMin}-${breakfastMax} ккал`);
      console.log(`Обед: ${lunchMin}-${lunchMax} ккал`);
      console.log(`Ужин: ${dinnerMin}-${dinnerMax} ккал`);
      console.log(`Перекусы: ${snacksMin}-${snacksMax} ккал`);
        
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

Для каждого блюда указывай его калорийность. Старайся составлять блюда как можно ближе к указанным диапазонам калорийности. Это очень важно!

`;
    }

    console.log('=== Запуск генерации плана питания ===');
    const startTime = Date.now();
    
    const mealPlan = await generateMealPlan(chainParams);

    const endTime = Date.now();
    console.log(`=== План питания сгенерирован за ${(endTime - startTime) / 1000} секунд ===`);

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