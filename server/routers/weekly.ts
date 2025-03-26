import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';


const mealSchema = z.object({
  name: z.string(),
  dishType: z.enum(['homemade', 'readymade']),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
      unit: z.string(),
    })
  ),
  nutrients: z.object({
    calories: z.number(),
    protein: z.number(),
    fats: z.number(),
    carbs: z.number(),
  }),
  servingSize: z.number(),
});

const weeklyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mealPlanId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(
    z.object({
      breakfast: mealSchema,
      lunch: mealSchema,
      dinner: mealSchema,
      snacks: mealSchema,
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  v: z.number(),
});

export const weeklyRouter = router({
  getWeeklyPlans: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const weeklyPlans = await ctx.prisma.weeklyplans.findMany({
          where: { userId: input.userId },
          orderBy: { createdAt: 'desc' },
        });
        return weeklyPlans;
      } catch (error) {
        console.error('Error fetching weekly plans:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch weekly plans',
          cause: error,
        });
      }
    }),

  getWeeklyPlan: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const weeklyPlan = await ctx.prisma.weeklyplans.findUnique({
          where: { id: input.id },
        });

        if (!weeklyPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weekly plan not found',
          });
        }

        return weeklyPlan;
      } catch (error) {
        console.error('Error fetching weekly plan:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch weekly plan',
          cause: error,
        });
      }
    }),

  createWeeklyPlan: publicProcedure.input(weeklyPlanSchema).mutation(async ({ ctx, input }) => {
    try {
      const weeklyPlan = await ctx.prisma.weeklyplans.create({
        data: {
          userId: input.userId,
          mealPlanId: input.mealPlanId,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          days: input.days,
          createdAt: new Date(input.createdAt),
          updatedAt: new Date(input.updatedAt),
          v: 0,
        },
      });

      console.log('Weekly plan created successfully:', weeklyPlan);
      return weeklyPlan;
    } catch (error) {
      console.error('Error creating weekly plan:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create weekly plan',
        cause: error,
      });
    }
  }),

  updateWeeklyPlan: publicProcedure
    .input(
      z.object({
        id: z.string(),
        plan: weeklyPlanSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedPlan = await ctx.prisma.weeklyplans.update({
          where: { id: input.id },
          data: {
            userId: input.plan.userId,
            mealPlanId: input.plan.mealPlanId,
            startDate: new Date(input.plan.startDate),
            endDate: new Date(input.plan.endDate),
            days: input.plan.days,
            updatedAt: new Date(input.plan.updatedAt),
            v: 0,
          },
        });

        if (!updatedPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weekly plan not found',
          });
        }

        console.log('Weekly plan updated successfully:', updatedPlan);
        return updatedPlan;
      } catch (error) {
        console.error('Error updating weekly plan:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update weekly plan',
          cause: error,
        });
      }
    }),

  getWeeklyPlanByMealPlanId: publicProcedure
    .input(
      z.object({
        mealPlanId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const weeklyPlan = await ctx.prisma.weeklyplans.findFirst({
          where: { mealPlanId: input.mealPlanId },
          orderBy: { createdAt: 'desc' },
        });

        if (!weeklyPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weekly plan not found for this meal plan',
          });
        }

        // Transform the database response to match the WeeklyPlan type
        return {
          ...weeklyPlan,
          startDate: weeklyPlan.startDate.toISOString(),
          endDate: weeklyPlan.endDate.toISOString(),
          createdAt: weeklyPlan.createdAt.toISOString(),
          updatedAt: weeklyPlan.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching weekly plan by meal plan id:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch weekly plan',
          cause: error,
        });
      }
    }),

  deleteWeeklyPlan: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedPlan = await ctx.prisma.weeklyplans.delete({
          where: { id: input.id },
        });

        if (!deletedPlan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weekly plan not found',
          });
        }

        console.log('Weekly plan deleted successfully:', deletedPlan);
        return deletedPlan;
      } catch (error) {
        console.error('Error deleting weekly plan:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete weekly plan',
          cause: error,
        });
      }
    }),
});
