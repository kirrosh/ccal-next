import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

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

export const userRouter = router({
  updateProfile: publicProcedure
    .input(userProfileSchema)
    .mutation(async ({ input }) => {
      // Here you would typically save to a database
      // For now, we'll just return the profile
      return input;
    }),
}); 