import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import prisma from './db/prisma';

export const createContext = async () => {
  const authData = await auth();
  
  if (!authData?.userId) {
    return {
      prisma,
      auth: null
    };
  }

  return {
    prisma,
    auth: authData
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create();

// Check if the user is signed in
// Otherwise, throw an UNAUTHORIZED code
const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);