import { z } from 'zod';

const envSchema = z.object({
  APP_BASE_PATH: z.string().default('/')
});
//  i changed the default value to '/' to ensure it works correctly in both development and production environments
export const env = envSchema.parse({
  APP_BASE_PATH: import.meta.env.VITE_APP_BASE_PATH
});
