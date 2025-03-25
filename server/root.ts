import { router } from './trpc';
import { userRouter } from './routers/user';
import { mealRouter } from './routers/meal';
import { profileRouter } from './routers/profile';

export const appRouter = router({
  user: userRouter,
  meal: mealRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter; 