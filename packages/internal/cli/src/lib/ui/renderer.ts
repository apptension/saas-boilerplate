import { color } from '@oclif/color';

// Box drawing characters
const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  teeRight: '├',
  teeLeft: '┤',
};

// Status icons
export const ICONS = {
  success: color.green('✓'),
  error: color.red('✗'),
  warning: color.yellow('⚠'),
  pending: color.dim('○'),
  running: color.cyan('●'),
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
};

// Colors - using functions to apply colors
export const colors = {
  title: (s: string) => color.bold(color.cyan(s)),
  step: (s: string) => color.white(s),
  stepNumber: (s: string) => color.dim(s),
  success: (s: string) => color.green(s),
  error: (s: string) => color.red(s),
  warning: (s: string) => color.yellow(s),
  dim: (s: string) => color.dim(s),
  highlight: (s: string) => color.cyan(s),
  url: (s: string) => color.underline(color.cyan(s)),
};

export interface Step {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: Error;
  output?: string;
}

/**
 * Render a box with a title
 */
export function renderBox(
  title: string,
  options: { width?: number; padding?: number } = {},
): string {
  const width = options.width ?? 65;
  const padding = options.padding ?? 2;

  const paddedTitle = ' '.repeat(padding) + title;
  const contentWidth = width - 2; // Account for borders
  const paddedContent = paddedTitle.padEnd(contentWidth);

  const topBorder =
    BOX.topLeft + BOX.horizontal.repeat(contentWidth) + BOX.topRight;
  const bottomBorder =
    BOX.bottomLeft + BOX.horizontal.repeat(contentWidth) + BOX.bottomRight;
  const contentLine = BOX.vertical + paddedContent + BOX.vertical;

  return [topBorder, contentLine, bottomBorder].join('\n');
}

/**
 * Render a summary box with multiple lines
 */
export function renderSummaryBox(
  title: string,
  lines: string[],
  options: { width?: number } = {},
): string {
  const width = options.width ?? 65;
  const contentWidth = width - 2;

  const topBorder =
    BOX.topLeft + BOX.horizontal.repeat(contentWidth) + BOX.topRight;
  const bottomBorder =
    BOX.bottomLeft + BOX.horizontal.repeat(contentWidth) + BOX.bottomRight;
  const emptyLine = BOX.vertical + ' '.repeat(contentWidth) + BOX.vertical;

  const titleLine =
    BOX.vertical + ('  ' + colors.title(title)).padEnd(contentWidth + 10) + BOX.vertical; // +10 for ANSI codes

  const contentLines = lines.map((line) => {
    // Account for ANSI codes in padding calculation
    const visibleLength = stripAnsi(line).length;
    const padding = contentWidth - visibleLength - 2;
    return BOX.vertical + '  ' + line + ' '.repeat(Math.max(0, padding)) + BOX.vertical;
  });

  return [topBorder, titleLine, emptyLine, ...contentLines, emptyLine, bottomBorder].join('\n');
}

/**
 * Strip ANSI codes from string for length calculation
 */
function stripAnsi(str: string): string {
   
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * Render a step line with status
 */
export function renderStep(
  step: Step,
  index: number,
  total: number,
  spinnerFrame?: number,
): string {
  const stepNum = colors.stepNumber(`[${index + 1}/${total}]`);
  const name = colors.step(step.name);

  let statusIcon: string;
  let durationStr = '';

  switch (step.status) {
    case 'success':
      statusIcon = ICONS.success;
      if (step.duration !== undefined) {
        durationStr = colors.dim(formatDuration(step.duration));
      }
      break;
    case 'error':
      statusIcon = ICONS.error;
      durationStr = colors.error('FAILED');
      break;
    case 'running':
      const frame = spinnerFrame ?? 0;
      statusIcon = color.cyan(ICONS.spinner[frame % ICONS.spinner.length]);
      if (step.duration !== undefined) {
        durationStr = colors.dim(formatDuration(step.duration));
      }
      break;
    case 'pending':
    default:
      statusIcon = ICONS.pending;
      break;
  }

  // Format: [1/5] Building email templates                    ✓ 3.2s
  const padding = 45 - stripAnsi(name).length;
  return `  ${stepNum} ${name}${' '.repeat(Math.max(1, padding))}${statusIcon} ${durationStr}`;
}

/**
 * Render error output block
 */
export function renderErrorOutput(output: string, maxLines = 20): string {
  const separator = colors.dim('─'.repeat(65));
  const header = colors.dim('─── Output ') + colors.dim('─'.repeat(54));

  const lines = output.split('\n');
  const truncated = lines.length > maxLines;
  const displayLines = truncated ? lines.slice(-maxLines) : lines;

  const formattedOutput = displayLines
    .map((line) => '  ' + line)
    .join('\n');

  const parts = [
    '',
    header,
    formattedOutput,
  ];

  if (truncated) {
    parts.push(colors.dim(`  ... (${lines.length - maxLines} lines truncated)`));
  }

  parts.push(separator, '');

  return parts.join('\n');
}

/**
 * Render a tip message
 */
export function renderTip(message: string): string {
  return colors.dim(`  Tip: ${message}`);
}

/**
 * Render keyboard shortcuts hint
 */
export function renderKeyboardHints(hints: Array<{ key: string; label: string }>): string {
  const formatted = hints
    .map(({ key, label }) => `${colors.highlight(`[${key}]`)} ${colors.dim(label)}`)
    .join('  ');
  return `\n        ${formatted}`;
}

/**
 * Clear the current line and move cursor up
 */
export function clearLine(): void {
  process.stdout.write('\x1B[2K\x1B[1A');
}

/**
 * Clear multiple lines
 */
export function clearLines(count: number): void {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1B[2K\x1B[1A');
  }
  process.stdout.write('\x1B[2K\r');
}

/**
 * Move cursor to beginning of line
 */
export function carriageReturn(): void {
  process.stdout.write('\r');
}

/**
 * Hide cursor
 */
export function hideCursor(): void {
  process.stdout.write('\x1B[?25l');
}

/**
 * Show cursor
 */
export function showCursor(): void {
  process.stdout.write('\x1B[?25h');
}

/**
 * StepRenderer class for managing multi-step progress
 */
export class StepRenderer {
  private steps: Step[] = [];
  private currentStepIndex = -1;
  private spinnerFrame = 0;
  private spinnerInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private stepStartTime: number = 0;
  private extraContent: string[] = [];

  constructor(private totalSteps: number) {
    // Initialize steps
    for (let i = 0; i < totalSteps; i++) {
      this.steps.push({ name: '', status: 'pending' });
    }
  }

  /**
   * Start rendering with a title box
   */
  start(title: string): void {
    this.startTime = Date.now();
    console.log(renderBox(title));
    console.log('');
    hideCursor();
  }

  /**
   * Start rendering without a title (when banner is shown separately)
   */
  startWithoutTitle(): void {
    this.startTime = Date.now();
    hideCursor();
  }

  /**
   * Begin a new step
   */
  startStep(name: string): void {
    this.currentStepIndex++;
    this.stepStartTime = Date.now();

    if (this.currentStepIndex < this.steps.length) {
      this.steps[this.currentStepIndex] = {
        name,
        status: 'running',
        duration: 0,
      };
    }

    this.startSpinner();
    this.render();
  }

  /**
   * Complete the current step successfully
   */
  completeStep(): void {
    if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
      this.steps[this.currentStepIndex].status = 'success';
      this.steps[this.currentStepIndex].duration = Date.now() - this.stepStartTime;
    }
    this.stopSpinner();
    this.printCompletedStep();
  }

  /**
   * Mark the current step as failed
   */
  failStep(error: Error, output?: string): void {
    if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
      this.steps[this.currentStepIndex].status = 'error';
      this.steps[this.currentStepIndex].duration = Date.now() - this.stepStartTime;
      this.steps[this.currentStepIndex].error = error;
      this.steps[this.currentStepIndex].output = output;
    }
    this.stopSpinner();
    this.printCompletedStep();

    // Show error output if available
    if (output) {
      console.log(renderErrorOutput(output));
      console.log(renderTip('Fix the error and run `pnpm saas up` again'));
    }
  }

  /**
   * Set extra content to render below steps (e.g., service health)
   * Note: The health dashboard handles its own clearing/re-rendering
   */
  setExtraContent(lines: string[]): void {
    this.extraContent = lines;
    // Don't render here - let the caller (health dashboard) handle rendering
  }

  /**
   * Clear extra content
   */
  clearExtraContent(): void {
    this.extraContent = [];
  }

  /**
   * Get total elapsed time
   */
  getTotalDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get current step elapsed time
   */
  getCurrentStepDuration(): number {
    return Date.now() - this.stepStartTime;
  }

  /**
   * Finish rendering and show summary
   */
  finish(summaryLines?: string[]): void {
    this.stopSpinner();
    showCursor();

    if (summaryLines && summaryLines.length > 0) {
      console.log('');
      console.log(
        renderSummaryBox('Ready! Your development environment is running', [
          ...summaryLines,
          '',
          `Total startup time: ${colors.highlight(formatDuration(this.getTotalDuration()))}`,
        ]),
      );
    }
  }

  /**
   * Clean up on error/exit
   */
  cleanup(): void {
    this.stopSpinner();
    showCursor();
  }

  private startSpinner(): void {
    if (this.spinnerInterval) return;

    this.spinnerInterval = setInterval(() => {
      this.spinnerFrame++;
      if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
        this.steps[this.currentStepIndex].duration = Date.now() - this.stepStartTime;
      }
      this.render();
    }, 80);
  }

  private stopSpinner(): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
  }

  private render(): void {
    // Only update the current step line in place - NO extra content during spinner
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) {
      return;
    }

    // If we have extra content, don't update the step line (health dashboard handles its own refresh)
    if (this.extraContent.length > 0) {
      return;
    }

    const step = this.steps[this.currentStepIndex];
    const line = renderStep(step, this.currentStepIndex, this.totalSteps, this.spinnerFrame);

    // Clear current line and write updated content
    process.stdout.write('\r\x1B[2K' + line);
  }

  /**
   * Print a completed step (moves to new line)
   */
  private printCompletedStep(): void {
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) {
      return;
    }

    const step = this.steps[this.currentStepIndex];
    const line = renderStep(step, this.currentStepIndex, this.totalSteps, this.spinnerFrame);

    // Clear line, print, and move to new line
    process.stdout.write('\r\x1B[2K' + line + '\n');
  }
}
