import { LoggerService } from "@nestjs/common";

type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export class JsonLogger implements LoggerService {
  constructor(private readonly service: string) {}

  log(message: unknown, context?: string): void {
    this.write("info", message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write("fatal", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("trace", message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const record = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      context,
      message: message instanceof Error ? message.message : message,
      trace,
    };
    const output = `${JSON.stringify(record)}\n`;
    if (level === "error" || level === "fatal") {
      process.stderr.write(output);
      return;
    }
    process.stdout.write(output);
  }
}

