import { color } from '@oclif/color';
import { ICONS, colors, formatDuration, hideCursor, showCursor, clearLines } from './renderer';

export interface SpinnerOptions {
  text: string;
  retryInfo?: {
    current: number;
    total: number;
  };
  showElapsed?: boolean;
}

/**
 * Enhanced spinner with retry count and elapsed time display
 */
export class EnhancedSpinner {
  private text: string;
  private retryInfo?: { current: number; total: number };
  private showElapsed: boolean;
  private frame = 0;
  private interval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private linesRendered = 0;
  private extraLines: string[] = [];
  private isRunning = false;

  constructor(options: SpinnerOptions) {
    this.text = options.text;
    this.retryInfo = options.retryInfo;
    this.showElapsed = options.showElapsed ?? true;
  }

  /**
   * Start the spinner
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    hideCursor();

    this.interval = setInterval(() => {
      this.frame++;
      this.render();
    }, 80);

    this.render();
  }

  /**
   * Stop the spinner
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    showCursor();
  }

  /**
   * Update the spinner text
   */
  setText(text: string): void {
    this.text = text;
    if (this.isRunning) {
      this.render();
    }
  }

  /**
   * Update retry information
   */
  setRetryInfo(current: number, total: number): void {
    this.retryInfo = { current, total };
    if (this.isRunning) {
      this.render();
    }
  }

  /**
   * Set extra content lines to display below the spinner
   */
  setExtraLines(lines: string[]): void {
    this.extraLines = lines;
    if (this.isRunning) {
      this.render();
    }
  }

  /**
   * Mark as successful
   */
  success(text?: string): void {
    this.stop();
    if (this.linesRendered > 0) {
      clearLines(this.linesRendered);
    }
    const finalText = text ?? this.text;
    const elapsed = this.showElapsed ? ` ${colors.dim(formatDuration(Date.now() - this.startTime))}` : '';
    console.log(`  ${ICONS.success} ${finalText}${elapsed}`);
    this.linesRendered = 0;
  }

  /**
   * Mark as failed
   */
  fail(text?: string): void {
    this.stop();
    if (this.linesRendered > 0) {
      clearLines(this.linesRendered);
    }
    const finalText = text ?? this.text;
    console.log(`  ${ICONS.error} ${colors.error(finalText)}`);
    this.linesRendered = 0;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  private render(): void {
    // Clear previous render
    if (this.linesRendered > 0) {
      clearLines(this.linesRendered);
    }

    const spinnerChar = color.cyan(ICONS.spinner[this.frame % ICONS.spinner.length]);
    const elapsed = this.showElapsed ? colors.dim(` ${formatDuration(Date.now() - this.startTime)}`) : '';

    let retryStr = '';
    if (this.retryInfo) {
      retryStr = colors.dim(` (attempt ${this.retryInfo.current}/${this.retryInfo.total})`);
    }

    const lines: string[] = [];
    lines.push(`  ${spinnerChar} ${this.text}${retryStr}${elapsed}`);

    // Add extra lines
    if (this.extraLines.length > 0) {
      lines.push(...this.extraLines.map((line) => `        ${line}`));
    }

    console.log(lines.join('\n'));
    this.linesRendered = lines.length;
  }
}

/**
 * Create a progress bar string
 */
export function createProgressBar(
  current: number,
  total: number,
  options: { width?: number; filled?: string; empty?: string } = {},
): string {
  const width = options.width ?? 20;
  const filled = options.filled ?? '█';
  const empty = options.empty ?? '░';

  const progress = Math.min(1, current / total);
  const filledCount = Math.round(progress * width);
  const emptyCount = width - filledCount;

  return (
    color.cyan(filled.repeat(filledCount)) +
    color.dim(empty.repeat(emptyCount)) +
    ` ${Math.round(progress * 100)}%`
  );
}

/**
 * Simple waiting animation with dots
 */
export class WaitingDots {
  private dots = 0;
  private maxDots = 3;
  private interval: NodeJS.Timeout | null = null;
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  start(): void {
    this.interval = setInterval(() => {
      this.dots = (this.dots + 1) % (this.maxDots + 1);
      process.stdout.write(`\r  ${this.text}${'.'.repeat(this.dots)}${' '.repeat(this.maxDots - this.dots)}`);
    }, 500);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write('\r' + ' '.repeat(this.text.length + this.maxDots + 4) + '\r');
  }
}
