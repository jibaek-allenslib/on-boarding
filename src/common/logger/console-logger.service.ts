import {
  Inject,
  Injectable,
  LoggerService,
  Optional,
  Scope,
} from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../app.config';

export enum Loglevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

function transformLoglevelToInt(loglevel: Loglevel): number {
  switch (loglevel) {
    case Loglevel.TRACE:
      return 5;
    case Loglevel.DEBUG:
      return 4;
    case Loglevel.INFO:
      return 3;
    case Loglevel.WARN:
      return 2;
    case Loglevel.ERROR:
      return 1;
  }
}

function needToLog(
  currentLoglevel: Loglevel,
  requestedLoglevel: Loglevel,
): boolean {
  const current = transformLoglevelToInt(currentLoglevel);
  const requested = transformLoglevelToInt(requestedLoglevel);
  return current >= requested;
}

@Injectable({ scope: Scope.TRANSIENT })
export class ConsoleLoggerService implements LoggerService {
  private classContext: string | undefined;
  private lastTimestamp: number;
  private skipColor = false;

  constructor(
    private readonly configService: ConfigService,
    @Optional() context?: string,
  ) {
    this.classContext = context;
    this.skipColor = process.env.NODE_ENV === 'production';
  }

  setContext(context: string): void {
    this.classContext = context;
  }

  setSkipColor(skipColor: boolean): void {
    this.skipColor = skipColor;
  }

  error(message: unknown, trace = '', functionContext?: string): void {
    this.printMessage(
      Loglevel.ERROR,
      message,
      this.makeContextString(functionContext),
      false,
      trace,
    );
    ConsoleLoggerService.printStackTrace(trace);
  }

  log(message: unknown, functionContext?: string): void {
    this.printMessage(
      Loglevel.INFO,
      message,
      this.makeContextString(functionContext),
      false,
    );
  }

  warn(message: unknown, functionContext?: string): void {
    this.printMessage(
      Loglevel.WARN,
      message,
      this.makeContextString(functionContext),
      false,
    );
  }

  debug(message: unknown, functionContext?: string): void {
    this.printMessage(
      Loglevel.DEBUG,
      message,
      this.makeContextString(functionContext),
      false,
    );
  }

  verbose(message: unknown, functionContext?: string): void {
    this.printMessage(
      Loglevel.TRACE,
      message,
      this.makeContextString(functionContext),
      false,
    );
  }

  private makeContextString(functionContext?: string): string {
    let context = this.classContext;
    if (!context) {
      context = 'Application';
    }
    if (functionContext) {
      context += '.' + functionContext + '()';
    }
    return context;
  }

  static sanitize(input: string): string {
    return (
      input
        // remove ASCII control characters
        .replace(/\p{C}/gu, '')
        // replace all non-zeros width spaces with one space
        .replace(/\p{Zs}/gu, ' ')
    );
  }

  private printMessage(
    level: Loglevel,
    message: unknown,
    context = '',
    isTimeDiffEnabled?: boolean,
    trace?: string,
  ): void {
    let output;

    if (this.skipColor) {
      if (isObject(message)) {
        output = `Object:\n${JSON.stringify(message, null, 2)}\n`;
      } else {
        output = message as string;
      }
    } else {
      if (isObject(message)) {
        output = `Object:\n${ConsoleLoggerService.sanitize(
          JSON.stringify(message, null, 2),
        )}\n`;
      } else {
        output = ConsoleLoggerService.sanitize(message as string);
      }
    }

    const timestamp = new Date().toISOString();
    const contextMessage = `[${context}]`;
    const timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);
    const levelString = `[${level.toUpperCase()}]`;

    process.stdout.write(
      `${timestamp} ${contextMessage} ${levelString} ${output}${timestampDiff}\n`,
    );
  }

  private updateAndGetTimestampDiff(isTimeDiffEnabled?: boolean): string {
    const includeTimestamp = this.lastTimestamp && isTimeDiffEnabled;
    const result = includeTimestamp
      ? ` +${Date.now() - this.lastTimestamp}ms`
      : '';
    this.lastTimestamp = Date.now();
    return result;
  }

  private static printStackTrace(trace: string): void {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}
