import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { NextRequest } from 'next/server';
import connectDB from '@/server/db/mongodb';
import { Context } from '@/server/trpc';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Initialize database connection
      await connectDB();
      return {};
    },
  });

export { handler as GET, handler as POST }; 