import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { generateMealPlan, regenerateMeal } from '../../services/langchain';
import { TRPCError } from '@trpc/server';

const targetDailyCaloriesSchema = z.object({
  breakfastMin: z.number(),
  breakfastMax: z.number(),
  lunchMin: z.number(),
  lunchMax: z.number(),
  dinnerMin: z.number(),
  dinnerMax: z.number(),
  snacksMin: z.number(),
  snacksMax: z.number(),
});

const userProfileSchema = z.object({
  userId: z.string(),
  gender: z.enum(['male', 'female']),
  age: z.number().min(1).max(120),
  height: z.number().min(50).max(250),
  weight: z.number().min(20).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  daily_calories: z.number().optional(),
  target_daily_calories: targetDailyCaloriesSchema.optional(),
});

const nutrientsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number(),
});

const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

const mealSchema = z.object({
  name: z.string(),
  dishType: z.enum(['homemade', 'readymade']),
  ingredients: z.array(ingredientSchema),
  nutrients: nutrientsSchema,
  servingSize: z.number(),
});

const dailyMenuSchema = z.object({
  breakfast: z.array(mealSchema),
  lunch: z.array(mealSchema),
  dinner: z.array(mealSchema),
  snacks: z.array(mealSchema),
});

const mealPlanInputSchema = z.object({
  userId: z.string(),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance']),
  preferences: z.array(z.string()),
  allergies: z.array(z.string()),
  availableProducts: z.array(z.string()),
  currentDate: z.string(),
  menu: dailyMenuSchema,
});

export const mealRouter = router({
  generateMealPlan: publicProcedure
    .input(
      z.object({
        profile: userProfileSchema,
        preferences: z.object({
          cuisine: z.string().optional(),
          dietaryRestrictions: z.array(z.string()).optional(),
          mealCount: z.number().min(1).max(7).default(7),
          allergies: z.array(z.string()).optional(),
          availableProducts: z.array(z.string()).optional(),
        }),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<string> => {
      const params = {
        goal: 'maintenance' as const,
        preferences: input.preferences.dietaryRestrictions || [],
        name: input.name || '',
        allergies: input.preferences.allergies || [],
        region: input.preferences.cuisine || 'general',
        current_date: new Date().toISOString().split('T')[0],
        available_products: input.preferences.availableProducts || [],
        user_profile_info: JSON.stringify(input.profile),
        target_daily_calories: input.profile.target_daily_calories
          ? {
              targetCalories: input.profile.daily_calories || 2000,
              ...input.profile.target_daily_calories,
            }
          : undefined,
      };

      const generatedMealPlan = await generateMealPlan(params);
      console.log(generatedMealPlan);
      try {
        const mealPlan = await ctx.prisma.mealplans.create({
          data: {
            userId: input.profile.userId,
            goal: params.goal,
            preferences: params.preferences,
            allergies: params.allergies,
            availableProducts: params.available_products,
            currentDate: params.current_date,
            menu: generatedMealPlan.menu,
            v: 0,
            createdAt: new Date(),
          },
        });

        return mealPlan.id;
      } catch (error) {
        console.error('Error saving meal plan:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save meal plan',
          cause: error,
        });
      }
    }),

  regenerateMeal: publicProcedure
    .input(
      z.object({
        profile: userProfileSchema,
        preferences: z.object({
          cuisine: z.string().optional(),
          dietaryRestrictions: z.array(z.string()).optional(),
        }),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
        mealPlanId: z.string(),
        mealIndex: z.number(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<any[]> => {
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

    

      // Update the meal in the database
      try {
        const mealPlan = await ctx.prisma.mealplans.findUnique({
          where: { id: input.mealPlanId },
        });

        const previousMeal = mealPlan?.menu[input.mealType][input.mealIndex];

        const params = {
          mealType: input.mealType,
          preferences: input.preferences.dietaryRestrictions || [],
          allergies: [], // Can be added to preferences later
          region: input.preferences.cuisine || 'general',
          current_date: new Date().toISOString().split('T')[0],
          user_profile_info: JSON.stringify(input.profile),
          minCalories,
          maxCalories,
          previousMeal: JSON.stringify(previousMeal),
        };
  
        const newMeal = await regenerateMeal(params);

        if (!mealPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Meal plan not found',
          });
        }

        // Create a new menu object with the updated meal at the specific index
        const updatedMenu = {
          ...mealPlan.menu,
          [input.mealType]: mealPlan.menu[input.mealType].map((meal, index) =>
            index === input.mealIndex ? newMeal || meal : meal
          ),
        };

        console.log('Updated menu:', updatedMenu, input.mealIndex);

        // Update the meal plan with the new menu
        await ctx.prisma.mealplans.update({
          where: { id: input.mealPlanId },
          data: { menu: updatedMenu },
        });

        return newMeal;
      } catch (error) {
        console.error('Error updating meal in database:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update meal in database',
          cause: error,
        });
      }
    }),

  saveMealPlan: publicProcedure.input(mealPlanInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const mealPlan = await ctx.prisma.mealplans.create({
        data: {
          ...input,
          v: 0,
          createdAt: new Date(),
        },
      });
      console.log('Meal plan saved successfully:', mealPlan);
      return mealPlan;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to save meal plan',
        cause: error,
      });
    }
  }),

  getMealPlans: protectedProcedure
    .query(async ({ ctx, input }) => {
      try {
        const mealPlans = await ctx.prisma.mealplans.findMany({
          where: { userId: ctx.auth.userId },
          orderBy: { createdAt: 'desc' },
        });
        console.log('Retrieved meal plans:', mealPlans);
        return mealPlans;
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch meal plans',
          cause: error,
        });
      }
    }),

  getMealPlan: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const mealPlan = await ctx.prisma.mealplans.findUnique({
        where: { id: input.id },
      });
      return mealPlan;
    }),

  deleteMealPlan: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedPlan = await ctx.prisma.mealplans.delete({
          where: { id: input.id },
        });

        if (!deletedPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Meal plan not found',
          });
        }

        console.log('Meal plan deleted successfully:', deletedPlan);
        return deletedPlan;
      } catch (error) {
        console.error('Error deleting meal plan:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete meal plan',
          cause: error,
        });
      }
    }),

  updateMealPlanName: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedPlan = await ctx.prisma.mealplans.update({
          where: { id: input.id },
          data: { name: input.name },
        });

        if (!updatedPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Meal plan not found',
          });
        }

        console.log('Meal plan name updated successfully:', updatedPlan);
        return updatedPlan;
      } catch (error) {
        console.error('Error updating meal plan name:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update meal plan name',
          cause: error,
        });
      }
    }),
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
    very_active: 'очень высокая активность',
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
