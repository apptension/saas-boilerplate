import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useMutation, useSubscription } from '@apollo/client/react';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { v4 as uuidv4 } from 'uuid';

import { aiChatSubscription, sendAiMessageMutation } from './aiAssistant.graphql';

// Debounce helper for rapid state updates
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

export interface ToolCall {
  name: string;
  displayName: string;
  status: 'running' | 'complete' | 'error';
  hasData?: boolean;
  timestamp: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: ToolCall[];
  isStreaming?: boolean;
}

export interface StreamingState {
  status: string | null;
  activeTools: ToolCall[];
  isStreaming: boolean;
}

export interface UseAiAssistantOptions {
  onError?: (error: Error) => void;
}

export interface UseAiAssistantReturn {
  messages: AiMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  isConnected: boolean;
  streamingState: StreamingState;
}

/**
 * Hook for interacting with the AI Assistant via GraphQL subscriptions.
 * Uses the same WebSocket infrastructure as notifications.
 */
export const useAiAssistant = (options: UseAiAssistantOptions = {}): UseAiAssistantReturn => {
  const { onError } = options;
  const currentTenantContext = useCurrentTenant() as { data?: { id?: string } | null } | undefined;
  const currentTenant = currentTenantContext?.data;
  
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    status: null,
    activeTools: [],
    isStreaming: false,
  });
  
  // Stable conversation ID for this session
  const conversationId = useMemo(() => uuidv4(), []);
  
  const currentMessageRef = useRef<{
    id: string;
    content: string;
    toolsUsed: ToolCall[];
  } | null>(null);

  // Track the last status to avoid unnecessary updates
  const lastStatusRef = useRef<string | null>(null);
  
  // Track processed subscription data to prevent duplicate processing
  // This is needed because useEffect can fire multiple times with the same subscription data
  const lastProcessedDataRef = useRef<typeof subscriptionData | null>(null);
  
  // Debounced status update to avoid rapid re-renders
  const debouncedSetStatus = useDebouncedCallback((status: string | null) => {
    if (lastStatusRef.current !== status) {
      lastStatusRef.current = status;
      setStreamingState((prev) => ({
        ...prev,
        status,
      }));
    }
  }, 50);

  // GraphQL mutation for sending messages
  const [sendMessageMutation] = useMutation(sendAiMessageMutation);

  // GraphQL subscription for receiving events
  const { data: subscriptionData } = useSubscription(aiChatSubscription, {
    variables: { conversationId },
    skip: !currentTenant?.id,
    onError: (err) => {
      console.error('[AI Assistant] Subscription error:', err);
      setError(err);
      onError?.(err);
    },
  });

  // Handle subscription events
  // Use queueMicrotask to defer state updates outside of React's render cycle
  // This prevents "Maximum update depth exceeded" errors caused by refs in UI components
  useEffect(() => {
    const event = subscriptionData?.aiChat?.event;
    if (!event) return;

    // Skip if we've already processed this exact subscription data object
    // This prevents duplicate processing when useEffect fires multiple times
    if (lastProcessedDataRef.current === subscriptionData) {
      return;
    }
    lastProcessedDataRef.current = subscriptionData;

    // Defer all state updates to the next microtask to avoid updating during React's commit phase
    queueMicrotask(() => {
      switch (event.eventType) {
        case 'status':
          // Use debounced update for rapid status events
          debouncedSetStatus(event.message || null);
          break;

        case 'tool_start': {
          const newTool: ToolCall = {
            name: event.toolName || '',
            displayName: event.toolDisplayName || '',
            status: 'running',
            timestamp: Date.now(),
          };
          
          if (currentMessageRef.current) {
            currentMessageRef.current.toolsUsed = [
              ...currentMessageRef.current.toolsUsed.filter(t => t.name !== event.toolName),
              newTool
            ];
          }
          
          setStreamingState((prev) => ({
            ...prev,
            activeTools: [...prev.activeTools.filter(t => t.name !== event.toolName), newTool],
          }));
          break;
        }

        case 'tool_complete':
          if (currentMessageRef.current) {
            currentMessageRef.current.toolsUsed = currentMessageRef.current.toolsUsed.map(t =>
              t.name === event.toolName
                ? { ...t, status: event.success ? 'complete' : 'error', hasData: event.hasData || false }
                : t
            );
          }
          
          setStreamingState((prev) => ({
            ...prev,
            activeTools: prev.activeTools.map(t =>
              t.name === event.toolName
                ? { ...t, status: event.success ? 'complete' : 'error', hasData: event.hasData || false }
                : t
            ),
          }));
          break;

        case 'content':
          if (currentMessageRef.current && event.text) {
            currentMessageRef.current.content += event.text;
            const currentContent = currentMessageRef.current.content;
            const messageId = currentMessageRef.current.id;
            const toolsUsed = currentMessageRef.current.toolsUsed;
            
            setMessages((prev) => {
              const existingIndex = prev.findIndex(m => m.id === messageId);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  content: currentContent,
                  isStreaming: true,
                };
                return updated;
              } else {
                return [...prev, {
                  id: messageId,
                  role: 'assistant' as const,
                  content: currentContent,
                  timestamp: new Date(),
                  toolsUsed: toolsUsed,
                  isStreaming: true,
                }];
              }
            });
          }
          break;

        case 'done': {
          if (currentMessageRef.current) {
            const messageId = currentMessageRef.current.id;
            const finalToolsUsed: ToolCall[] = event.toolsUsed
              ?.filter((name): name is string => name != null)
              .map(name => ({
                name,
                displayName: name,
                status: 'complete' as const,
                timestamp: Date.now(),
              })) || currentMessageRef.current.toolsUsed || [];
            
            setMessages((prev) => prev.map(m =>
              m.id === messageId
                ? { ...m, toolsUsed: finalToolsUsed, isStreaming: false }
                : m
            ));
            lastStatusRef.current = null;
            setStreamingState({
              status: null,
              activeTools: [],
              isStreaming: false,
            });
            setIsLoading(false);
          }
          currentMessageRef.current = null;
          break;
        }

        case 'error': {
          const err = new Error(event.message || 'An error occurred');
          setError(err);
          onError?.(err);
          
          if (currentMessageRef.current) {
            setMessages((prev) => [...prev, {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: `Sorry, I encountered an error: ${event.message}`,
              timestamp: new Date(),
            }]);
          }
          lastStatusRef.current = null;
          setStreamingState({
            status: null,
            activeTools: [],
            isStreaming: false,
          });
          setIsLoading(false);
          currentMessageRef.current = null;
          break;
        }
      }
    });
  }, [subscriptionData, onError, debouncedSetStatus]);

  const sendMessage = useCallback(async (message: string) => {
    if (!currentTenant?.id) {
      const err = new Error('No tenant selected');
      setError(err);
      onError?.(err);
      return;
    }

    // Add user message immediately
    const userMessage: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Set up tracking for assistant response
    currentMessageRef.current = {
      id: `assistant-${Date.now()}`,
      content: '',
      toolsUsed: [],
    };

    // Build history from current messages
    const history = messages.map(m => JSON.stringify({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setStreamingState({
      status: 'Connecting...',
      activeTools: [],
      isStreaming: true,
    });

    try {
      // Send message via GraphQL mutation
      const result = await sendMessageMutation({
        variables: {
          message,
          tenantId: currentTenant.id,
          conversationId,
          history,
        },
      });

      if (result.data?.sendAiMessage?.error) {
        throw new Error(result.data.sendAiMessage.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      onError?.(error);
      
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't send your message: ${error.message}`,
        timestamp: new Date(),
      }]);
      setStreamingState({
        status: null,
        activeTools: [],
        isStreaming: false,
      });
      setIsLoading(false);
      currentMessageRef.current = null;
    }
  }, [currentTenant?.id, conversationId, messages, sendMessageMutation, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    lastStatusRef.current = null;
    lastProcessedDataRef.current = null;
    setStreamingState({
      status: null,
      activeTools: [],
      isStreaming: false,
    });
    currentMessageRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isConnected: !!currentTenant?.id,
    streamingState,
  };
};
