import { router } from './trpc';
import { userRouter } from './routers/user';
import { mealRouter } from './routers/meal';
import { profileRouter } from './routers/profile';
import { weeklyRouter } from './routers/weekly';

export const appRouter = router({
  user: userRouter,
  meal: mealRouter,
  profile: profileRouter,
  weekly: weeklyRouter,
});

export type AppRouter = typeof appRouter; 