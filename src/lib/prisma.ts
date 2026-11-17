import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createMockModel() {
  const methods: Record<string, (args?: Record<string, unknown>) => unknown> = {
    findMany: async () => [],
    findFirst: async () => null,
    findFirstOrThrow: async () => null,
    findUnique: async () => null,
    findUniqueOrThrow: async () => null,
    count: async () => 0,
    groupBy: async () => [],
    aggregate: async (args) => {
      const sumSpec = args?._sum as Record<string, boolean> | undefined;
      const _sum: Record<string, null> = {};
      if (sumSpec && typeof sumSpec === "object") {
        for (const key of Object.keys(sumSpec)) {
          _sum[key] = null;
        }
      }
      return { _sum, _count: {}, _avg: {}, _min: {}, _max: {} };
    },
    create: async (args) => ({ id: "mock-id", ...((args?.data as object) ?? {}) }),
    createMany: async (args) => ({
      count: Array.isArray(args?.data) ? args.data.length : 0,
    }),
    update: async (args) => ({
      id: (args?.where as { id?: string } | undefined)?.id ?? "mock-id",
      ...((args?.data as object) ?? {}),
    }),
    updateMany: async () => ({ count: 0 }),
    upsert: async (args) => ({
      id: "mock-id",
      ...((args?.create as object) ?? (args?.update as object) ?? {}),
    }),
    delete: async (args) => ({
      id: (args?.where as { id?: string } | undefined)?.id ?? "mock-id",
    }),
    deleteMany: async () => ({ count: 0 }),
  };

  return new Proxy(
    {},
    {
      get(_, prop: string) {
        if (prop in methods) {
          return methods[prop];
        }
        return async () => null;
      },
    }
  );
}

function createMockPrisma(): PrismaClient {
  const mockModel = createMockModel();
  const mockClient: Record<string, unknown> = {
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => [],
    $queryRawUnsafe: async () => [],
    $executeRaw: async () => 0,
    $executeRawUnsafe: async () => 0,
    $on: () => {},
    $use: () => {},
  };

  const proxy: PrismaClient = new Proxy(mockClient, {
    get(target, prop: string) {
      if (prop === "$transaction") {
        return async (arg: unknown) => {
          if (Array.isArray(arg)) {
            return Promise.all(arg);
          }
          if (typeof arg === "function") {
            return (arg as (tx: PrismaClient) => Promise<unknown>)(proxy);
          }
          return null;
        };
      }
      if (prop in target) {
        return target[prop];
      }
      if (prop === "then") {
        return undefined;
      }
      return mockModel;
    },
  }) as unknown as PrismaClient;

  return proxy;
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; code?: string; message?: string };
  return (
    err.name === "PrismaClientInitializationError" ||
    err.name === "PrismaClientRustPanicError" ||
    err.code === "P1001" ||
    err.code === "P1002" ||
    err.code === "P1003" ||
    err.code === "P1017" ||
    Boolean(err.message && /Environment variable not found: DATABASE_URL|Can't reach database server|ECONNREFUSED/i.test(err.message))
  );
}

function createResilientPrisma(): PrismaClient {
  const mock = createMockPrisma();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  if (!hasDatabaseUrl) {
    console.warn("[AI Studio] DATABASE_URL not configured — using mock Prisma client");
    return mock;
  }

  let realClient: PrismaClient;
  try {
    realClient = new PrismaClient();
  } catch (err) {
    console.warn("[AI Studio] Database initialization failed — using mock Prisma client", err);
    return mock;
  }

  return new Proxy(realClient, {
    get(target, prop: string | symbol) {
      const value = Reflect.get(target, prop, target);
      if (prop === "$transaction") {
        return async (arg: unknown) => {
          try {
            return await (value as (a: unknown) => Promise<unknown>).call(target, arg);
          } catch (err) {
            if (isConnectionError(err)) {
              console.warn("[AI Studio] Database unreachable during transaction — falling back to mock");
              return (mock.$transaction as (a: unknown) => Promise<unknown>)(arg);
            }
            throw err;
          }
        };
      }
      if (typeof value === "object" && value !== null) {
        return new Proxy(value, {
          get(modelTarget, method: string | symbol) {
            const fn = Reflect.get(modelTarget, method, modelTarget);
            if (typeof fn !== "function") return fn;
            return async (...args: unknown[]) => {
              try {
                return await fn.apply(modelTarget, args);
              } catch (err) {
                if (isConnectionError(err)) {
                  console.warn(`[AI Studio] Database unreachable during ${String(prop)}.${String(method)} — falling back to mock`);
                  const mockModel = Reflect.get(mock, prop);
                  const mockFn = Reflect.get(mockModel as object, method);
                  if (typeof mockFn === "function") {
                    return mockFn(...args);
                  }
                }
                throw err;
              }
            };
          },
        });
      }
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createResilientPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
