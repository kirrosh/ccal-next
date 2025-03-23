import { router } from '../trpc';
import { mealRouter } from './meal';
import { userRouter } from './user';

export const appRouter = router({
  meal: mealRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter; 