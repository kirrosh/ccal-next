import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
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
  gender: z.enum(['male', 'female']),
  age: z.number().min(1).max(120),
  height: z.number().min(50).max(250),
  weight: z.number().min(20).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  daily_calories: z.number().optional(),
  target_daily_calories: targetDailyCaloriesSchema.optional(),
});

export const profileRouter = router({
  create: protectedProcedure
    .input(userProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const existingProfile = await ctx.prisma.userprofiles.findUnique({
          where: { userId: ctx.auth.userId },
        });

        if (existingProfile) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Profile already exists for this user',
          });
        }

        const profileData = {
          userId: ctx.auth.userId,
          gender: input.gender,
          age: input.age,
          height: input.height,
          weight: input.weight,
          activityLevel: input.activityLevel,
          daily_calories: input.daily_calories,
          target_daily_calories: input.target_daily_calories,
          createdAt: new Date(),
          updatedAt: new Date(),
          v: 0,
        };

        const profile = await ctx.prisma.userprofiles.create({
          data: profileData,
        });

        console.log('User profile created successfully:', profile);
        return profile;
      } catch (error) {
        console.error('Error creating user profile:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user profile',
          cause: error,
        });
      }
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      let profile = await ctx.prisma.userprofiles.findUnique({
        where: { userId: ctx.auth.userId },
      });
      
      if (!profile) {
        // Create a default profile if it doesn't exist
        profile = await ctx.prisma.userprofiles.create({
          data: {
            userId: ctx.auth.userId,
            gender: 'male', // default value
            age: 30, // default value
            height: 170, // default value
            weight: 70, // default value
            activityLevel: 'moderate', // default value
            createdAt: new Date(),
            updatedAt: new Date(),
            v: 0,
          },
        });
      }

      return profile;
    } catch (error) {
      console.error('Error fetching/creating user profile:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch/create user profile',
        cause: error,
      });
    }
  }),
}); 