import "@testing-library/jest-dom/vitest"

import { config } from "./env"

process.env.DATABASE_URL = config.databaseUrl
process.env.JWT_SECRET = config.jwtSecret

