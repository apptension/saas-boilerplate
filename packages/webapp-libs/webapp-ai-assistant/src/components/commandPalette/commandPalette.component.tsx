import { useCallback, useEffect, useState, useRef, KeyboardEvent, memo, useMemo, ChangeEvent } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Dialog, DialogContent, DialogTitle } from '@sb/webapp-core/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent } from '@sb/webapp-core/components/ui/card';
import { cn } from '@sb/webapp-core/lib/utils';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { 
  Bot, 
  Sparkles, 
  Send, 
  User, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Database,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3,
  MessageSquare,
  Plus,
  X,
  ExternalLink,
  FolderOpen,
  Building2,
  Users,
  Receipt,
} from 'lucide-react';

import { useAiAssistant, AiMessage, ToolCall } from '../../hooks/useAiAssistant';

// Entity link patterns for rich linking in AI responses
const ENTITY_LINK_PATTERNS = {
  item: /^item:(.+)$/,
  project: /^project:(.+)$/,
  client: /^client:(.+)$/,
  person: /^person:(.+)$/,
  invoice: /^invoice:(.+)$/,
  // Also match URL-encoded versions (entity/type/id)
  projectUrl: /^\/entity\/project\/(.+)$/,
  clientUrl: /^\/entity\/client\/(.+)$/,
  personUrl: /^\/entity\/person\/(.+)$/,
  invoiceUrl: /^\/entity\/invoice\/(.+)$/,
};

/**
 * Pre-process AI message content to ensure entity links are in a format
 * that ReactMarkdown will parse correctly.
 * 
 * Converts: [Name](project:ID) → [Name](/entity/project/ID)
 * 
 * This is needed because some markdown parsers don't recognize custom URL schemes.
 * The ID is URL-encoded to handle base64 characters like = and +.
 */
const preprocessEntityLinks = (content: string): string => {
  if (!content) return content;
  
  // Pattern to match markdown links with our custom entity format
  // Matches: [any text](entity_type:ID)
  const entityLinkPattern = /\[([^\]]+)\]\((project|client|person|invoice):([^)]+)\)/g;
  
  return content.replace(entityLinkPattern, (_match, text, entityType, id) => {
    // URL-encode the ID to handle base64 special characters (=, +, /)
    const encodedId = encodeURIComponent(id);
    // Convert to URL path format that markdown parsers recognize
    return `[${text}](/entity/${entityType}/${encodedId})`;
  });
};

// Route mappings for entity links
const ENTITY_ROUTES = {
  item: 'crud-demo-item',
  project: 'management/projects',
  client: 'management/clients',
  person: 'management/people',
  invoice: 'management/invoices',
};

// Icons for entity types
const ENTITY_ICONS = {
  item: Database,
  project: FolderOpen,
  client: Building2,
  person: Users,
  invoice: Receipt,
};

interface EntityLinkProps {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}

/**
 * Smart link component that handles entity links (project:ID, client:ID, etc.)
 * and converts them to proper tenant-scoped routes.
 */
const EntityLink = ({ href, children, onNavigate }: EntityLinkProps) => {
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();
  
  // Check if this is an entity link (supports both formats)
  const entityMatch = useMemo(() => {
    if (!href) return null;
    
    // Check URL path format first: /entity/type/id
    const urlPathMatch = href.match(/^\/entity\/(item|project|client|person|invoice)\/(.+)$/);
    if (urlPathMatch) {
      // Decode the URL-encoded ID (handles base64 characters like =, +, /)
      const decodedId = decodeURIComponent(urlPathMatch[2]);
      return { type: urlPathMatch[1] as keyof typeof ENTITY_ROUTES, id: decodedId };
    }
    
    // Check original format: type:id
    for (const [entityType, pattern] of Object.entries(ENTITY_LINK_PATTERNS)) {
      // Skip the URL patterns (they're handled above)
      if (entityType.endsWith('Url')) continue;
      
      const match = href.match(pattern);
      if (match) {
        return { type: entityType as keyof typeof ENTITY_ROUTES, id: match[1] };
      }
    }
    return null;
  }, [href]);
  
  if (entityMatch) {
    const { type, id } = entityMatch;
    const route = `${ENTITY_ROUTES[type]}/${id}`;
    const Icon = ENTITY_ICONS[type];
    
    // Badge color schemes for different entity types
    const badgeStyles = {
      item: 'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60 border-sky-200 dark:border-sky-800',
      project: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800',
      client: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800',
      person: 'bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60 border-violet-200 dark:border-violet-800',
      invoice: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800',
    };
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const fullPath = generateTenantPath(route);
      // Close modal first, then navigate after a brief delay to avoid UI flicker
      onNavigate?.();
      setTimeout(() => {
        navigate(fullPath);
      }, 50);
    };
    
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
          'border transition-all duration-150 cursor-pointer',
          'hover:shadow-sm active:scale-[0.98]',
          badgeStyles[type]
        )}
      >
        <Icon className="h-3 w-3" />
        <span>{children}</span>
      </button>
    );
  }
  
  // Regular external link
  return (
    <a 
      href={href} 
      className="inline-flex items-center gap-1 text-primary hover:underline" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLink className="h-3 w-3 opacity-70" />
    </a>
  );
};

export interface CommandPaletteProps {
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export const CommandPalette = ({ trigger, triggerClassName }: CommandPaletteProps) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages, 
    isConnected,
    streamingState,
  } = useAiAssistant({
    onError: (error) => {
      console.error('AI Assistant error:', error);
    },
  });

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle auto-focus when dialog opens
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    textareaRef.current?.focus();
  }, []);

  // Scroll to bottom when messages change, streaming updates, or tools change
  const shouldScroll = messages.length > 0 || streamingState.isStreaming;
  const messagesLength = messages.length;
  const lastMessageContent = messages[messages.length - 1]?.content?.length ?? 0;
  const activeToolsCount = streamingState.activeTools.length;
  
  useEffect(() => {
    if (messagesEndRef.current && shouldScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesLength, lastMessageContent, streamingState.isStreaming, activeToolsCount, shouldScroll]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    // Don't clear messages when closing - keep conversation state
  }, []);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setInputValue('');
  }, [clearMessages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // Shift+Enter = new line (default browser behavior)
      if (e.shiftKey) {
        return;
      }
      // Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux) = insert new line manually
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = inputValue.substring(0, start) + '\n' + inputValue.substring(end);
        setInputValue(newValue);
        // Set cursor position after the inserted newline
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          // Trigger resize
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        });
        return;
      }
      // Plain Enter = submit
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, inputValue]);

  // Auto-resize textarea
  const handleTextareaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize: reset height to auto to get the correct scrollHeight
    const textarea = e.target;
    textarea.style.height = 'auto';
    // Set to scrollHeight but cap at max height (150px ~ 4-5 lines)
    const maxHeight = 150;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const examplePrompts = [
    {
      icon: Database,
      label: intl.formatMessage({
        defaultMessage: 'List my items',
        id: 'AI Assistant / Example prompt 1',
      }),
    },
    {
      icon: FolderOpen,
      label: intl.formatMessage({
        defaultMessage: 'Show my documents',
        id: 'AI Assistant / Example prompt 2',
      }),
    },
    {
      icon: Zap,
      label: intl.formatMessage({
        defaultMessage: 'What recent activity do we have?',
        id: 'AI Assistant / Example prompt 3',
      }),
    },
  ];

  const handleExampleClick = useCallback((prompt: string) => {
    setInputValue(prompt);
    // Reset textarea height when setting value programmatically
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, []);

  const defaultTrigger = (
    <Button
      variant="outline"
      className={cn(
        'relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2',
        'hover:bg-primary/5 hover:border-primary/30 transition-all duration-200',
        triggerClassName
      )}
      onClick={() => setOpen(true)}
    >
      <Sparkles className="h-4 w-4 xl:mr-2 text-primary" />
      <span className="hidden xl:inline-flex">
        <FormattedMessage defaultMessage="Ask Navigator..." id="AI Assistant / Search placeholder" />
      </span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );

  const hasMessages = messages.length > 0 || streamingState.isStreaming;

  return (
    <>
      {trigger || defaultTrigger}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className={cn(
            "max-w-3xl w-[95vw] h-[85vh] max-h-[700px] p-0 sm:p-0 gap-0 sm:gap-0",
            "bg-gradient-to-b from-background to-muted/20",
            "border-border/50 shadow-2xl",
            "flex flex-col overflow-hidden",
            "[&>button]:hidden" // Hide default close button - we have custom one
          )}
          aria-describedby={undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <VisuallyHidden.Root asChild>
            <DialogTitle>SaaS Navigator</DialogTitle>
          </VisuallyHidden.Root>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                {/* Connection status indicator */}
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background transition-colors",
                  isConnected ? "bg-green-500" : "bg-amber-500 animate-pulse"
                )} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  <FormattedMessage defaultMessage="SaaS Navigator" id="AI Assistant / Title" />
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? (
                    <FormattedMessage defaultMessage="AI-powered workspace assistant" id="AI Assistant / Subtitle" />
                  ) : (
                    <FormattedMessage defaultMessage="Connecting..." id="AI Assistant / Connecting" />
                  )}
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {/* New Chat button - only show when there are messages */}
              {hasMessages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    <FormattedMessage defaultMessage="New Chat" id="AI Assistant / New Chat" />
                  </span>
                </Button>
              )}
              {/* Close button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6 min-h-full">
              {!hasMessages ? (
                <WelcomeScreen 
                  examplePrompts={examplePrompts} 
                  onExampleClick={handleExampleClick} 
                />
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isStreamingAssistantMessage = 
                      message.role === 'assistant' && 
                      message.isStreaming;
                    
                    // For STREAMING assistant messages, we render them separately below the tools
                    // Skip rendering here - will be rendered after the streaming UI
                    if (isStreamingAssistantMessage) {
                      return null;
                    }
                    
                    // For COMPLETED assistant messages, show tools BEFORE the message content
                    if (message.role === 'assistant') {
                      return (
                        <div key={message.id} className="space-y-4">
                          {/* Show tools used above the message */}
                          {message.toolsUsed && message.toolsUsed.length > 0 && (
                            <Card className="border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Database className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    <FormattedMessage 
                                      defaultMessage="Data sources used" 
                                      id="AI Assistant / Data sources used" 
                                    />
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {message.toolsUsed.map((tool, toolIndex) => (
                                    <ToolCallItem 
                                      key={typeof tool === 'string' ? tool : `${tool.name}-${toolIndex}`}
                                      tool={typeof tool === 'string' 
                                        ? { name: tool, displayName: tool, status: 'complete', timestamp: Date.now() }
                                        : tool
                                      }
                                      index={toolIndex}
                                    />
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          {/* Show message content */}
                          {message.content && (
                            <MessageBubble message={message} hideToolsInBubble onNavigate={() => setOpen(false)} />
                          )}
                        </div>
                      );
                    }
                    
                    // User messages render normally
                    return <MessageBubble key={message.id} message={message} onNavigate={() => setOpen(false)} />;
                  })}

                  {/* Streaming UI - Status, Tools, then Message Content */}
                  {streamingState.isStreaming && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Status message - show when streaming */}
                      {streamingState.status && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{streamingState.status}</p>
                          </div>
                        </div>
                      )}

                      {/* Active tool calls - shown while running */}
                      {streamingState.activeTools.length > 0 && (
                        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Database className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                <FormattedMessage 
                                  defaultMessage="Accessing data sources" 
                                  id="AI Assistant / Accessing data" 
                                />
                              </span>
                            </div>
                            <div className="space-y-2">
                              {streamingState.activeTools.map((tool, index) => (
                                <ToolCallItem 
                                  key={`${tool.name}-${tool.timestamp}`} 
                                  tool={tool} 
                                  index={index}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Streaming message content - appears AFTER tools */}
                      {messages.filter(m => m.isStreaming).map((message) => (
                        message.content && (
                          <MessageBubble key={message.id} message={message} hideToolsInBubble onNavigate={() => setOpen(false)} />
                        )
                      ))}
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t bg-background/80 backdrop-blur-sm p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative flex items-end">
                <MessageSquare className="absolute left-3 bottom-[14px] h-4 w-4 text-muted-foreground pointer-events-none" />
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Ask about revenue, projects, costs, forecasts...',
                    id: 'AI Assistant / Input placeholder',
                  })}
                  disabled={!isConnected}
                  rows={1}
                  className={cn(
                    "w-full min-h-[44px] max-h-[150px] rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm leading-6",
                    "ring-offset-background placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200 resize-none overflow-y-auto"
                  )}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim() || !isConnected}
                size="lg"
                className="h-[44px] w-[44px] p-0 rounded-xl shadow-lg shadow-primary/20 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              <FormattedMessage
                defaultMessage="Real-time financial insights · Press Esc to close"
                id="AI Assistant / Footer hint"
              />
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Welcome screen component
interface WelcomeScreenProps {
  examplePrompts: { icon: any; label: string }[];
  onExampleClick: (prompt: string) => void;
}

const WelcomeScreen = ({ examplePrompts, onExampleClick }: WelcomeScreenProps) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl mb-6">
      <Bot className="h-8 w-8 text-primary-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">
      <FormattedMessage defaultMessage="How can I help you today?" id="AI Assistant / Welcome title" />
    </h3>
    <p className="text-muted-foreground mb-8 max-w-md">
      <FormattedMessage
        defaultMessage="I can analyze your financial data, provide insights on project profitability, forecast trends, and help with strategic decisions."
        id="AI Assistant / Welcome message"
      />
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
      {examplePrompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onExampleClick(prompt.label)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl",
            "bg-muted/50 hover:bg-muted border border-transparent hover:border-border",
            "transition-all duration-200 group"
          )}
        >
          <prompt.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {prompt.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

// Tool call item with animation
interface ToolCallItemProps {
  tool: ToolCall;
  index: number;
}

const ToolCallItem = ({ tool, index }: ToolCallItemProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
        tool.status === 'running' && "bg-background/50",
        tool.status === 'complete' && "bg-green-500/10",
        tool.status === 'error' && "bg-red-500/10",
        "animate-in slide-in-from-left-4",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {tool.status === 'running' && (
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        </div>
      )}
      {tool.status === 'complete' && (
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        </div>
      )}
      {tool.status === 'error' && (
        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center animate-in zoom-in duration-200">
          <XCircle className="h-3.5 w-3.5 text-red-600" />
        </div>
      )}
      <span className={cn(
        'text-sm flex-1 transition-colors duration-200',
        tool.status === 'running' && 'text-foreground font-medium',
        tool.status === 'complete' && 'text-muted-foreground',
        tool.status === 'error' && 'text-red-600',
      )}>
        {tool.displayName}
      </span>
      {tool.status === 'complete' && tool.hasData && (
        <Zap className="h-4 w-4 text-amber-500 animate-in zoom-in duration-200" />
      )}
    </div>
  );
};

// Streaming cursor component - hidden by default, shown via parent CSS
const StreamingCursor = () => (
  <span className="streaming-cursor hidden w-2 h-4 ml-1 bg-primary rounded-sm animate-pulse align-middle" />
);

// Factory function for Markdown components - allows passing callbacks and streaming state
const createMarkdownComponents = (onNavigate?: () => void, isStreaming?: boolean) => ({
  h1: ({ children }: any) => <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0">{children}{isStreaming && <StreamingCursor />}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}{isStreaming && <StreamingCursor />}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-semibold mt-3 mb-1.5 first:mt-0">{children}{isStreaming && <StreamingCursor />}</h3>,
  h4: ({ children }: any) => <h4 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}{isStreaming && <StreamingCursor />}</h4>,
  h5: ({ children }: any) => <h5 className="text-sm font-medium mt-2 mb-1 first:mt-0">{children}{isStreaming && <StreamingCursor />}</h5>,
  h6: ({ children }: any) => <h6 className="text-xs font-medium mt-2 mb-1 first:mt-0 text-muted-foreground">{children}{isStreaming && <StreamingCursor />}</h6>,
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}{isStreaming && <StreamingCursor />}</p>,
  br: () => <br className="block h-2" />,
  ul: ({ children }: any) => (
    <ul className="mb-3 last:mb-0 space-y-1 pl-4 list-disc marker:text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="mb-3 last:mb-0 space-y-1 pl-4 list-decimal marker:text-muted-foreground">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="text-sm pl-1 leading-relaxed [&>ul]:mt-1 [&>ol]:mt-1 [&>ul]:mb-0 [&>ol]:mb-0">{children}{isStreaming && <StreamingCursor />}</li>
  ),
  strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  code: ({ children }: any) => (
    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">{children}</code>
  ),
  pre: ({ children }: any) => (
    <pre className="p-3 rounded-lg bg-muted overflow-x-auto my-3 font-mono text-xs">{children}</pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  // Smart link handling - converts entity links to navigation
  a: ({ href, children }: any) => (
    <EntityLink href={href} onNavigate={onNavigate}>
      {children}
    </EntityLink>
  ),
  img: ({ src, alt }: any) => (
    <span className="block my-3 text-center">
      <img
        src={src}
        alt={alt || ''}
        className="inline-block rounded-lg max-w-full h-auto border shadow-sm"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {alt && <span className="block text-xs text-muted-foreground mt-1">{alt}</span>}
    </span>
  ),
  del: ({ children }: any) => <del className="line-through text-muted-foreground">{children}</del>,
  sup: ({ children }: any) => <sup className="text-xs">{children}</sup>,
  sub: ({ children }: any) => <sub className="text-xs">{children}</sub>,
  mark: ({ children }: any) => <mark className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">{children}</mark>,
  input: ({ checked, type }: any) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 h-4 w-4 rounded border-border accent-primary"
        />
      );
    }
    return null;
  },
  table: ({ children }: any) => (
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
  thead: ({ children }: any) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
  th: ({ children }: any) => (
    <th className="px-2.5 py-1.5 text-left text-xs font-semibold text-foreground whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-2.5 py-1.5 text-xs text-muted-foreground">{children}</td>
  ),
  hr: () => <hr className="my-4 border-border" />,
});

// Message bubble with markdown rendering
interface MessageBubbleProps {
  message: AiMessage;
  hideToolsInBubble?: boolean;
  onNavigate?: () => void;
}

const MessageBubble = memo(({ message, hideToolsInBubble = false, onNavigate }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  // Memoize markdown components - pass streaming state for cursor
  const markdownComponents = useMemo(
    () => createMarkdownComponents(onNavigate, message.isStreaming), 
    [onNavigate, message.isStreaming]
  );

  return (
    <div 
      className={cn(
        'flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[85%] rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground px-4 py-3'
            : 'bg-card border shadow-sm px-5 py-4'
        )}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className={cn(
            "text-sm text-foreground/90 leading-relaxed",
            // Show streaming cursor only on the very last element
            message.isStreaming && [
              // Show cursor in last direct child (p, h1-h6)
              "[&>*:last-child>.streaming-cursor]:inline-block",
              // Show cursor in last li of last ul/ol
              "[&>ul:last-child>li:last-child>.streaming-cursor]:inline-block",
              "[&>ol:last-child>li:last-child>.streaming-cursor]:inline-block",
              // Hide cursor in ul/ol container itself (only show in li)
              "[&>ul:last-child>.streaming-cursor]:hidden",
              "[&>ol:last-child>.streaming-cursor]:hidden",
            ]
          )}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {preprocessEntityLinks(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
