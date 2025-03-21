import { chain } from '@/lchain';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      people_count, 
      goal, 
      preferences, 
      allergies, 
      region, 
      available_products,
      user_profile // New field containing user profile data
    } = body;

    // Parameters for the LLM chain
    const chainParams: any = {
      people_count,
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
      
      // Create a formatted string with user profile information
      chainParams.user_profile_info = `
- user_profile: Информация о пользователе:
  * Пол: ${gender}
  * Возраст: ${user_profile.age} лет
  * Рост: ${user_profile.height} см
  * Вес: ${user_profile.weight} кг
  * Уровень активности: ${activityLabels[user_profile.activityLevel] || user_profile.activityLevel}
  * Суточная потребность в калориях: ${user_profile.daily_calories} ккал

ВАЖНО О КАЛОРИЙНОСТИ РАЦИОНА:
При составлении рациона используй следующие правила для суточной калорийности:
- Если цель "weight_loss" (похудение): ${Math.round(user_profile.daily_calories * 0.85)} ккал в день (-15% от суточной потребности)
- Если цель "muscle_gain" (набор массы): ${Math.round(user_profile.daily_calories * 1.15)} ккал в день (+15% от суточной потребности)
- Если цель "maintenance" (поддержание формы): ${user_profile.daily_calories} ккал в день (равно суточной потребности)

Текущая цель пользователя: "${goal}"

РАСПРЕДЕЛЕНИЕ КАЛОРИЙ ПО ПРИЕМАМ ПИЩИ (примерно):
- Завтрак: 25-30% дневной калорийности
- Обед: 35-40% дневной калорийности
- Ужин: 20-25% дневной калорийности
- Перекусы: 10-15% дневной калорийности

Обязательно учитывай эти данные при составлении блюд и их калорийности!
`;
    }

    const mealPlan = await chain.invoke(chainParams);

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