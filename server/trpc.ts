import { initTRPC } from '@trpc/server';

export interface Context {
  // Add any additional context properties here if needed
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure; 