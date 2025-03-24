import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

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
  id: z.string(),
  gender: z.enum(['male', 'female']),
  age: z.number().min(1).max(120),
  height: z.number().min(50).max(250),
  weight: z.number().min(20).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  daily_calories: z.number().optional(),
  target_daily_calories: targetDailyCaloriesSchema.optional()
});

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existingUser = await ctx.prisma.users.findUnique({
          where: { email: input.email }
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          });
        }

        const userData = {
          name: input.name,
          email: input.email,
          v: 0,
          createdAt: new Date()
        };

        const user = await ctx.prisma.users.create({
          data: userData
        });
        
        console.log('User created successfully:', user);
        return user;
      } catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
          cause: error,
        });
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.prisma.users.findMany();
      console.log('Retrieved users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch users',
        cause: error,
      });
    }
  }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.users.findUnique({
          where: { id: input }
        });
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        
        console.log('Retrieved user:', user);
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
          cause: error,
        });
      }
    }),

  updateProfile: publicProcedure
    .input(userProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await ctx.prisma.users.update({
          where: { id: input.id },
          data: input
        });
        return updatedUser;
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
          cause: error,
        });
      }
    }),
}); 