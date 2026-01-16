/**
 * Logging utility
 * Single Responsibility: Centralized logging with levels
 */

import type { ILogger } from '../interfaces';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Console-based logger implementation
 */
export class ConsoleLogger implements ILogger {
  private readonly minLevel: LogLevel;
  private readonly environment: string;

  constructor(minLevel: LogLevel = LogLevel.INFO, environment: string = 'development') {
    this.minLevel = minLevel;
    this.environment = environment;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(message: string, meta?: Record<string, unknown>): string {
    if (!meta || Object.keys(meta).length === 0) {
      return message;
    }
    return `${message} ${JSON.stringify(meta)}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${this.formatMessage(message, meta)}`);
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${this.formatMessage(message, meta)}`);
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${this.formatMessage(message, meta)}`);
    }
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMeta = { ...meta, error: error?.message || error?.toString() };
      console.error(`[ERROR] ${this.formatMessage(message, errorMeta)}`, error);
    }
  }
}

/**
 * No-op logger for testing
 */
export class NoOpLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

/**
 * Singleton logger instance
 */
export const logger = new ConsoleLogger(
  process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  process.env.NODE_ENV || 'development'
);
