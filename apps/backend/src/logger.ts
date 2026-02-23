import { createLogger } from "@harmoni/shared";

export const logger = createLogger("harmoni-backend");

export function childLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}
