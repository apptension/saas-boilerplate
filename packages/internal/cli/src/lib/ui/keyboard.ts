import * as readline from 'readline';
import { EventEmitter } from 'events';

export type KeyBinding = {
  key: string;
  label: string;
  action: () => void | Promise<void>;
};

/**
 * Keyboard handler for interactive CLI
 * Handles raw keyboard input and key bindings
 */
export class KeyboardHandler extends EventEmitter {
  private bindings: Map<string, KeyBinding> = new Map();
  private rl: readline.Interface | null = null;
  private enabled = false;
  private cleanupHandler: (() => void | Promise<void>) | null = null;

  constructor() {
    super();
  }

  /**
   * Register a key binding
   */
  bind(key: string, label: string, action: () => void | Promise<void>): void {
    this.bindings.set(key.toLowerCase(), { key, label, action });
  }

  /**
   * Remove a key binding
   */
  unbind(key: string): void {
    this.bindings.delete(key.toLowerCase());
  }

  /**
   * Set cleanup handler for Ctrl+C
   */
  onCleanup(handler: () => void | Promise<void>): void {
    this.cleanupHandler = handler;
  }

  /**
   * Enable keyboard input handling
   */
  enable(): void {
    if (this.enabled || !process.stdin.isTTY) return;

    this.enabled = true;

    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // Enable raw mode to capture individual keystrokes
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    // Handle keypress events
    process.stdin.on('data', this.handleKeypress);

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', this.handleSigint);
  }

  /**
   * Disable keyboard input handling
   */
  disable(): void {
    if (!this.enabled) return;

    this.enabled = false;

    // Remove event listeners
    process.stdin.off('data', this.handleKeypress);
    process.off('SIGINT', this.handleSigint);

    // Restore terminal mode
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }

    // Close readline interface
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Get all registered key bindings for display
   */
  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }

  /**
   * Check if keyboard handling is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  private handleKeypress = async (data: Buffer): Promise<void> => {
    const key = data.toString();

    // Check for Ctrl+C (ASCII 3)
    if (key === '\x03') {
      await this.handleSigint();
      return;
    }

    // Check for 'q' to quit
    if (key.toLowerCase() === 'q') {
      await this.handleSigint();
      return;
    }

    // Check registered bindings
    const binding = this.bindings.get(key.toLowerCase());
    if (binding) {
      try {
        await binding.action();
        this.emit('action', binding.key);
      } catch (error) {
        this.emit('error', error);
      }
    }
  };

  private handleSigint = async (): Promise<void> => {
    this.emit('quit');

    if (this.cleanupHandler) {
      try {
        await this.cleanupHandler();
      } catch (error) {
        // Ignore cleanup errors on exit
      }
    }

    this.disable();
    process.exit(0);
  };
}

/**
 * Create a simple keyboard handler with common bindings
 */
export function createKeyboardHandler(options: {
  onVerboseToggle?: () => void;
  onLogsToggle?: () => void;
  onQuit?: () => Promise<void>;
}): KeyboardHandler {
  const handler = new KeyboardHandler();

  if (options.onVerboseToggle) {
    handler.bind('v', 'verbose', options.onVerboseToggle);
  }

  if (options.onLogsToggle) {
    handler.bind('l', 'logs', options.onLogsToggle);
  }

  if (options.onQuit) {
    handler.onCleanup(options.onQuit);
  }

  return handler;
}

/**
 * Format key bindings for display
 */
export function formatKeyBindings(bindings: KeyBinding[]): string {
  return bindings
    .map(({ key, label }) => `[${key}] ${label}`)
    .join('  ');
}
