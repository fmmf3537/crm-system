export const config = {
  databaseUrl: process.env.TEST_DATABASE_URL ?? "file:./test.db",
  jwtSecret: process.env.TEST_JWT_SECRET ?? "test-secret",
}

