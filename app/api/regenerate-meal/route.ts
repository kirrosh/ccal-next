import { regenerateMeal } from '@/services/langchain';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Получен запрос на регенерацию блюда ===');
    
    const body = await request.json();
    const { 
      mealType,
      preferences, 
      allergies, 
      region,
      user_profile,
      target_daily_calories
    } = body;

    console.log(`Тип приема пищи: ${mealType}`);
    console.log(`Предпочтения: ${preferences?.join(', ')}`);
    console.log(`Аллергии: ${allergies?.join(', ')}`);
    console.log(`Регион: ${region}`);
    
    // Определяем диапазон калорий для данного типа приема пищи
    let minCalories = 0;
    let maxCalories = 0;
    
    if (target_daily_calories) {
      switch (mealType) {
        case 'breakfast':
          minCalories = target_daily_calories.breakfastMin;
          maxCalories = target_daily_calories.breakfastMax;
          break;
        case 'lunch':
          minCalories = target_daily_calories.lunchMin;
          maxCalories = target_daily_calories.lunchMax;
          break;
        case 'dinner':
          minCalories = target_daily_calories.dinnerMin;
          maxCalories = target_daily_calories.dinnerMax;
          break;
        case 'snack':
          minCalories = target_daily_calories.snacksMin;
          maxCalories = target_daily_calories.snacksMax;
          break;
      }
    }

    // Форматируем информацию о пользователе
    let user_profile_info = '';
    if (user_profile) {
      const gender = user_profile.gender === 'male' ? 'мужской' : 'женский';
      const activityLabels: Record<string, string> = {
        sedentary: 'малоподвижный образ жизни',
        light: 'легкая активность (1-3 раза в неделю)',
        moderate: 'умеренная активность (3-5 раз в неделю)',
        active: 'высокая активность (6-7 раз в неделю)',
        very_active: 'очень высокая активность'
      };
      
      user_profile_info = `
- user_profile: Информация о пользователе:
  * Пол: ${gender}
  * Возраст: ${user_profile.age} лет
  * Рост: ${user_profile.height} см
  * Вес: ${user_profile.weight} кг
  * Уровень активности: ${activityLabels[user_profile.activityLevel] || user_profile.activityLevel}
  * Суточная потребность в калориях: ${user_profile.daily_calories} ккал
`;
    }

    // Параметры для регенерации блюда
    const params = {
      mealType,
      preferences,
      allergies,
      region,
      current_date: new Date().toISOString().split('T')[0],
      user_profile_info,
      minCalories,
      maxCalories
    };

    console.log('=== Запуск регенерации блюда ===');
    const startTime = Date.now();
    
    const newMeal = await regenerateMeal(params);

    const endTime = Date.now();
    console.log(`=== Блюдо сгенерировано за ${(endTime - startTime) / 1000} секунд ===`);

    return NextResponse.json(newMeal);
  } catch (error) {
    console.error('Error regenerating meal:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate meal' },
      { status: 500 }
    );
  }
} 