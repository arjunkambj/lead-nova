type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private prefix: string;
  private level: LogLevel;
  
  constructor(prefix: string, options?: LoggerOptions) {
    this.prefix = prefix;
    this.level = options?.level || "info";
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;
    
    switch (level) {
      case "debug":
        console.debug(logMessage, context || "");
        break;
      case "info":
        console.info(logMessage, context || "");
        break;
      case "warn":
        console.warn(logMessage, context || "");
        break;
      case "error":
        console.error(logMessage, context || "");
        break;
    }
  }
  
  debug(message: string, context?: LogContext): void {
    this.formatMessage("debug", message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.formatMessage("info", message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.formatMessage("warn", message, context);
  }
  
  error(message: string, error?: Error | LogContext): void {
    if (error instanceof Error) {
      this.formatMessage("error", message, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else {
      this.formatMessage("error", message, error);
    }
  }
}

export function createLogger(prefix: string, options?: LoggerOptions): Logger {
  return new Logger(prefix, options);
}