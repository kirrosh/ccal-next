import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { NextRequest } from 'next/server';
import prisma from '@/server/db/prisma';
import { Context } from '@/server/trpc';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      return {
        prisma,
      };
    },
  });

export { handler as GET, handler as POST };
