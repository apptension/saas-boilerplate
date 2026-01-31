import {
  Bold,
  Code,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Minus,
} from 'lucide-react';
import React, { forwardRef, useCallback, useRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { AtSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix: string;
  placeholder: string;
  block?: boolean;
  shortcut?: string;
}

/**
 * Insert text at cursor position in textarea
 */
const insertAtCursor = (
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string,
  suffix: string,
  placeholder: string,
  block?: boolean
) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);
  const textToWrap = selectedText || placeholder;
  
  let before = value.substring(0, start);
  let after = value.substring(end);
  
  // For block elements, ensure we're on a new line
  if (block && before.length > 0 && !before.endsWith('\n')) {
    before += '\n';
  }
  if (block && after.length > 0 && !after.startsWith('\n')) {
    after = '\n' + after;
  }
  
  const newText = before + prefix + textToWrap + suffix + after;
  onChange(newText);
  
  // Set cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    const newStart = before.length + prefix.length;
    const newEnd = newStart + textToWrap.length;
    textarea.setSelectionRange(newStart, newEnd);
  });
};

/**
 * Render mentions in text (format: @[userId:userName])
 */
const renderMentions = (text: string) => {
  const mentionPattern = /@\[([^\]]+)\]/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = mentionPattern.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Extract userName from @[userId:userName]
    const mentionContent = match[1];
    const colonIndex = mentionContent.indexOf(':');
    const userName = colonIndex > 0 ? mentionContent.substring(colonIndex + 1) : mentionContent;

    // Add mention badge
    parts.push(
      <span
        key={key++}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
      >
        <AtSign className="h-3 w-3" />
        {userName}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  ({ value, onChange, placeholder, disabled, className, minHeight = '200px' }, ref) => {
    const intl = useIntl();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [showPreview, setShowPreview] = useState(false);
    
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    // Define toolbar actions
    const toolbarActions: (ToolbarAction | 'divider')[] = [
      {
        icon: Bold,
        label: intl.formatMessage({ defaultMessage: 'Bold', id: 'MarkdownEditor / Bold' }),
        prefix: '**',
        suffix: '**',
        placeholder: 'bold text',
        shortcut: '⌘B',
      },
      {
        icon: Italic,
        label: intl.formatMessage({ defaultMessage: 'Italic', id: 'MarkdownEditor / Italic' }),
        prefix: '_',
        suffix: '_',
        placeholder: 'italic text',
        shortcut: '⌘I',
      },
      {
        icon: Strikethrough,
        label: intl.formatMessage({ defaultMessage: 'Strikethrough', id: 'MarkdownEditor / Strikethrough' }),
        prefix: '~~',
        suffix: '~~',
        placeholder: 'strikethrough',
      },
      {
        icon: Code,
        label: intl.formatMessage({ defaultMessage: 'Code', id: 'MarkdownEditor / Code' }),
        prefix: '`',
        suffix: '`',
        placeholder: 'code',
      },
      'divider',
      {
        icon: Heading1,
        label: intl.formatMessage({ defaultMessage: 'Heading 1', id: 'MarkdownEditor / Heading 1' }),
        prefix: '# ',
        suffix: '',
        placeholder: 'Heading 1',
        block: true,
      },
      {
        icon: Heading2,
        label: intl.formatMessage({ defaultMessage: 'Heading 2', id: 'MarkdownEditor / Heading 2' }),
        prefix: '## ',
        suffix: '',
        placeholder: 'Heading 2',
        block: true,
      },
      {
        icon: Heading3,
        label: intl.formatMessage({ defaultMessage: 'Heading 3', id: 'MarkdownEditor / Heading 3' }),
        prefix: '### ',
        suffix: '',
        placeholder: 'Heading 3',
        block: true,
      },
      'divider',
      {
        icon: List,
        label: intl.formatMessage({ defaultMessage: 'Bullet List', id: 'MarkdownEditor / Bullet List' }),
        prefix: '- ',
        suffix: '',
        placeholder: 'list item',
        block: true,
      },
      {
        icon: ListOrdered,
        label: intl.formatMessage({ defaultMessage: 'Numbered List', id: 'MarkdownEditor / Numbered List' }),
        prefix: '1. ',
        suffix: '',
        placeholder: 'list item',
        block: true,
      },
      {
        icon: Quote,
        label: intl.formatMessage({ defaultMessage: 'Quote', id: 'MarkdownEditor / Quote' }),
        prefix: '> ',
        suffix: '',
        placeholder: 'quote',
        block: true,
      },
      'divider',
      {
        icon: Link2,
        label: intl.formatMessage({ defaultMessage: 'Link', id: 'MarkdownEditor / Link' }),
        prefix: '[',
        suffix: '](url)',
        placeholder: 'link text',
        shortcut: '⌘K',
      },
      {
        icon: Minus,
        label: intl.formatMessage({ defaultMessage: 'Divider', id: 'MarkdownEditor / Divider' }),
        prefix: '---',
        suffix: '',
        placeholder: '',
        block: true,
      },
    ];

    const handleToolbarClick = useCallback((action: ToolbarAction) => {
      if (!textareaRef.current || disabled) return;
      insertAtCursor(textareaRef.current, value, onChange, action.prefix, action.suffix, action.placeholder, action.block);
    }, [value, onChange, disabled]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === 'b') {
        e.preventDefault();
        if (textareaRef.current) {
          insertAtCursor(textareaRef.current, value, onChange, '**', '**', 'bold text');
        }
      } else if (isMod && e.key === 'i') {
        e.preventDefault();
        if (textareaRef.current) {
          insertAtCursor(textareaRef.current, value, onChange, '_', '_', 'italic text');
        }
      } else if (isMod && e.key === 'k') {
        e.preventDefault();
        if (textareaRef.current) {
          insertAtCursor(textareaRef.current, value, onChange, '[', '](url)', 'link text');
        }
      }
    }, [value, onChange, disabled]);

    // Sync scroll between textarea and preview
    const handleScroll = useCallback(() => {
      if (!textareaRef.current || !previewRef.current) return;
      previewRef.current.scrollTop = textareaRef.current.scrollTop;
      previewRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }, []);

    return (
      <TooltipProvider delayDuration={300}>
        <div className={cn(
          'flex flex-col rounded-lg border border-input bg-background overflow-hidden',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className
        )}>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-0.5 px-2 py-1.5 border-b border-input bg-muted/50 flex-wrap">
            <div className="flex items-center gap-0.5 flex-wrap">
              {toolbarActions.map((item, index) => {
                if (item === 'divider') {
                  return <div key={`divider-${index}`} className="w-px h-5 bg-border mx-1.5" />;
                }
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleToolbarClick(item);
                        }}
                        disabled={disabled || showPreview}
                        className={cn(
                          'p-1.5 rounded-md transition-all',
                          'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'disabled:opacity-50 disabled:pointer-events-none'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                          {item.shortcut}
                        </kbd>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            {/* Preview Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={disabled}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    showPreview && 'bg-accent/50 text-foreground'
                  )}
                >
                  {showPreview ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {showPreview ? (
                  <span>{intl.formatMessage({ defaultMessage: 'Hide Preview', id: 'MarkdownEditor / Hide Preview' })}</span>
                ) : (
                  <span>{intl.formatMessage({ defaultMessage: 'Show Preview', id: 'MarkdownEditor / Show Preview' })}</span>
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Editor container - toggle between edit and preview */}
          <div className="flex-1 relative" style={{ minHeight }}>
            {showPreview ? (
              /* Preview mode */
              <div
                ref={previewRef}
                className={cn(
                  'absolute inset-0 w-full h-full overflow-auto px-4 py-3',
                  // Prose styles - same as display
                  'prose prose-sm dark:prose-invert max-w-none',
                  'prose-headings:font-semibold prose-headings:tracking-tight',
                  'prose-h1:text-2xl prose-h1:mt-4 prose-h1:mb-3',
                  'prose-h2:text-xl prose-h2:mt-3 prose-h2:mb-2',
                  'prose-h3:text-lg prose-h3:mt-2 prose-h3:mb-1',
                  'prose-p:my-2 prose-p:leading-relaxed',
                  'prose-strong:font-semibold prose-strong:text-foreground',
                  'prose-em:italic',
                  'prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5',
                  'prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5',
                  'prose-li:my-0.5',
                  'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
                  'prose-code:text-sm prose-code:font-mono prose-code:text-foreground',
                  'prose-code:before:content-none prose-code:after:content-none',
                  'prose-blockquote:border-l-4 prose-blockquote:border-border',
                  'prose-blockquote:pl-4 prose-blockquote:py-0.5 prose-blockquote:my-2',
                  'prose-blockquote:text-muted-foreground prose-blockquote:not-italic',
                  'prose-a:text-primary prose-a:underline prose-a:underline-offset-4',
                  'prose-hr:my-4 prose-hr:border-border',
                  'prose-table:my-3'
                )}
              >
                {value ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => {
                        // Convert children to string for mention processing
                        const textContent = Array.isArray(children)
                          ? children.map((child) => (typeof child === 'string' ? child : String(child))).join('')
                          : String(children || '');
                        return <p>{renderMentions(textContent)}</p>;
                      },
                      table: ({ children }) => (
                        <div 
                          className="overflow-x-auto my-3 rounded-lg border"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
                          }}
                        >
                          <table className="min-w-full divide-y divide-border text-xs whitespace-nowrap">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                      tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                      tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                      th: ({ children }) => (
                        <th className="px-2.5 py-1.5 text-left text-xs font-semibold text-foreground whitespace-nowrap">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="px-2.5 py-1.5 text-xs text-muted-foreground">{children}</td>
                      ),
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground/60">{placeholder || 'Preview'}</p>
                )}
              </div>
            ) : (
              /* Edit mode */
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                spellCheck={false}
                className={cn(
                  'absolute inset-0 w-full h-full resize-none bg-transparent',
                  'px-4 py-3 text-sm leading-relaxed font-mono',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
                  'overflow-auto'
                )}
              />
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
