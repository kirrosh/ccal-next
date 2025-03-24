import { router } from '../trpc';
import { mealRouter } from './meal';
import { userRouter } from './user';
import { weeklyRouter } from './weekly';

export const appRouter = router({
  meal: mealRouter,
  user: userRouter,
  weekly: weeklyRouter,
});

export type AppRouter = typeof appRouter;
