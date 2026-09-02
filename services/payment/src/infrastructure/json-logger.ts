import { type LoggerService } from "@nestjs/common";
export class JsonLogger implements LoggerService {
  constructor(private readonly service: string) {}
  log(message: unknown, context?: string) { this.write("info", message, context); }
  fatal(message: unknown, context?: string) { this.write("fatal", message, context); }
  error(message: unknown, trace?: string, context?: string) { this.write("error", message, context, trace); }
  warn(message: unknown, context?: string) { this.write("warn", message, context); }
  debug(message: unknown, context?: string) { this.write("debug", message, context); }
  verbose(message: unknown, context?: string) { this.write("trace", message, context); }
  private write(level: string, message: unknown, context?: string, trace?: string) { const output = `${JSON.stringify({ timestamp: new Date().toISOString(), level, service: this.service, context, message: message instanceof Error ? message.message : message, trace })}\n`; (level === "error" || level === "fatal" ? process.stderr : process.stdout).write(output); }
}
