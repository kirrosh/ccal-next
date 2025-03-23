import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generateMealPlan, regenerateMeal } from '../../services/langchain';

const targetDailyCaloriesSchema = z.object({
  breakfastMin: z.number(),
  breakfastMax: z.number(),
  lunchMin: z.number(),
  lunchMax: z.number(),
  dinnerMin: z.number(),
  dinnerMax: z.number(),
  snacksMin: z.number(),
  snacksMax: z.number()
});

const userProfileSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number().min(1).max(120),
  height: z.number().min(50).max(250),
  weight: z.number().min(20).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  daily_calories: z.number().optional(),
  target_daily_calories: targetDailyCaloriesSchema.optional()
});

export const mealRouter = router({
  generateMealPlan: publicProcedure
    .input(z.object({
      profile: userProfileSchema,
      preferences: z.object({
        cuisine: z.string().optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        mealCount: z.number().min(1).max(7).default(7)
      })
    }))
    .mutation(async ({ input }) => {
      const params = {
        goal: "maintenance" as const,
        preferences: input.preferences.dietaryRestrictions || [],
        allergies: [], // Can be added to preferences later
        region: input.preferences.cuisine || "general",
        current_date: new Date().toISOString().split('T')[0],
        available_products: [], // Can be added later
        user_profile_info: JSON.stringify(input.profile),
        target_daily_calories: input.profile.target_daily_calories ? {
          targetCalories: input.profile.daily_calories || 2000,
          ...input.profile.target_daily_calories
        } : undefined
      };

      const mealPlan = await generateMealPlan(params);
      return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...mealPlan,
      };
    }),

  regenerateMeal: publicProcedure
    .input(z.object({
      profile: userProfileSchema,
      preferences: z.object({
        cuisine: z.string().optional(),
        dietaryRestrictions: z.array(z.string()).optional()
      }),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks'])
    }))
    .mutation(async ({ input }) => {
      let minCalories = 0;
      let maxCalories = 0;
      
      if (input.profile.target_daily_calories) {
        switch (input.mealType) {
          case 'breakfast':
            minCalories = input.profile.target_daily_calories.breakfastMin;
            maxCalories = input.profile.target_daily_calories.breakfastMax;
            break;
          case 'lunch':
            minCalories = input.profile.target_daily_calories.lunchMin;
            maxCalories = input.profile.target_daily_calories.lunchMax;
            break;
          case 'dinner':
            minCalories = input.profile.target_daily_calories.dinnerMin;
            maxCalories = input.profile.target_daily_calories.dinnerMax;
            break;
          case 'snacks':
            minCalories = input.profile.target_daily_calories.snacksMin;
            maxCalories = input.profile.target_daily_calories.snacksMax;
            break;
        }
      }

      const params = {
        mealType: input.mealType,
        preferences: input.preferences.dietaryRestrictions || [],
        allergies: [], // Can be added to preferences later
        region: input.preferences.cuisine || "general",
        current_date: new Date().toISOString().split('T')[0],
        user_profile_info: JSON.stringify(input.profile),
        minCalories,
        maxCalories
      };

      const newMeal = await regenerateMeal(params);
      return newMeal;
    })
});

// Helper function to format user profile info
function formatUserProfileInfo(userProfile: {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  daily_calories?: number;
  target_daily_calories?: {
    breakfastMin: number;
    breakfastMax: number;
    lunchMin: number;
    lunchMax: number;
    dinnerMin: number;
    dinnerMax: number;
    snacksMin: number;
    snacksMax: number;
  };
}) {
  const gender = userProfile.gender === 'male' ? 'мужской' : 'женский';
  const activityLabels: Record<string, string> = {
    sedentary: 'малоподвижный образ жизни',
    light: 'легкая активность (1-3 раза в неделю)',
    moderate: 'умеренная активность (3-5 раз в неделю)',
    active: 'высокая активность (6-7 раз в неделю)',
    very_active: 'очень высокая активность'
  };

  let caloriesInfo = '';
  if (userProfile.daily_calories) {
    caloriesInfo = `  * Суточная потребность в калориях: ${userProfile.daily_calories} ккал\n`;
  }

  let targetCaloriesInfo = '';
  if (userProfile.target_daily_calories) {
    const { target_daily_calories } = userProfile;
    targetCaloriesInfo = `
  * Целевая калорийность по приемам пищи:
    - Завтрак: ${target_daily_calories.breakfastMin}-${target_daily_calories.breakfastMax} ккал
    - Обед: ${target_daily_calories.lunchMin}-${target_daily_calories.lunchMax} ккал
    - Ужин: ${target_daily_calories.dinnerMin}-${target_daily_calories.dinnerMax} ккал
    - Перекусы: ${target_daily_calories.snacksMin}-${target_daily_calories.snacksMax} ккал
`;
  }

  return `
- user_profile: Информация о пользователе:
  * Пол: ${gender}
  * Возраст: ${userProfile.age} лет
  * Рост: ${userProfile.height} см
  * Вес: ${userProfile.weight} кг
  * Уровень активности: ${activityLabels[userProfile.activityLevel] || userProfile.activityLevel}${caloriesInfo}${targetCaloriesInfo}
`;
} 