import pino from "pino";

export interface Logger {
  child(bindings: Record<string, unknown>): Logger;
  debug(obj: object, msg?: string, ...args: unknown[]): void;
  debug(msg: string, ...args: unknown[]): void;
  info(obj: object, msg?: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(obj: object, msg?: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(obj: object, msg?: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

const isProd = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");

const isNode = typeof process !== "undefined" && process.versions?.node;
const prettyTransport =
  !isProd && isNode
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, singleLine: true, hideObject: true },
        },
      }
    : {};

/** Node.js (backend, desktop) logger using pino */
export function createLogger(service: string): Logger {
  return pino({
    level,
    ...prettyTransport,
    base: { service },
  }) as unknown as Logger;
}

/** Browser logger - light wrapper around console */
export function createBrowserLogger(service: string): Logger {
  const prefix = `[${service}]`;
  const log =
    (method: "debug" | "info" | "warn" | "error") =>
    (objOrMsg: object | string, msg?: string, ...args: unknown[]) => {
      const fn = console[method];
      if (typeof objOrMsg === "string") {
        fn(prefix, objOrMsg, ...args);
      } else {
        fn(prefix, msg ?? "", objOrMsg, ...args);
      }
    };
  return {
    child: (bindings: Record<string, unknown>) =>
      createBrowserLogger(`${service}:${JSON.stringify(bindings)}`),
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
}
