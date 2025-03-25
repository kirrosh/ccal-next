import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { NextRequest } from 'next/server';
import prisma from '@/server/db/prisma';
import { Context, createContext } from '@/server/trpc';
import { auth } from '@clerk/nextjs/server'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
