import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { Button } from '@sb/webapp-core/components/buttons';
import { Form, FormControl, FormField, FormItem, Input } from '@sb/webapp-core/components/forms';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { generateSaasIdeasMutation } from './saasIdeas.graphql';

const MAX_KEYWORDS_LENGTH = 200;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export const SaasIdeas = () => {
  const intl = useIntl();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: intl.formatMessage({
        defaultMessage:
          "Hello! I'm your AI SaaS ideas generator powered by OpenAI. I can help you generate creative SaaS product ideas based on keywords you provide.\n\nJust share keywords related to the type of SaaS product you're interested in (e.g., 'project management, CRM, task tracking'), and I'll suggest innovative SaaS ideas for you!",
        id: 'SaaS ideas / Welcome message',
      }),
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const {
    form: {
      register,
      formState: { errors },
      handleSubmit,
      reset,
    },
    form,
  } = useApiForm({
    defaultValues: {
      keywords: '',
    },
  });

  const [commitGenerateSaasIdeasMutation, { loading }] = useMutation(generateSaasIdeasMutation, {
    onError: (error) => {
      console.error('GraphQL Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({ description: error.message, variant: 'destructive' });
      setIsTyping(false);
    },
    onCompleted: (data) => {
      console.log('GraphQL Response:', data);
      console.log('Full data object:', JSON.stringify(data, null, 2));
      const response = data?.generateSaasIdeas?.response;
      console.log('Extracted response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', response?.length);

      if (response) {
        // Check if response looks like code (contains common code patterns)
        const looksLikeCode = /(function|const|import|export|def |class |<|>|{|}|;|\(\))/.test(response);
        if (looksLikeCode) {
          console.warn('Response looks like code!', response.substring(0, 500));
        }

        setIsTyping(false);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: response,
              timestamp: new Date(),
            },
          ]);
        }, 500);
      } else {
        console.warn('No response in data:', data);
        setIsTyping(false);
      }
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const keywordsArray = data.keywords.split(',').map((keyword) => keyword.trim());
    console.log('Form submit - keywords:', keywordsArray);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.keywords,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    reset();

    try {
      await commitGenerateSaasIdeasMutation({
        variables: {
          input: {
            keywords: keywordsArray,
          },
        },
      });
    } catch (error) {
      console.error('Mutation error in handleFormSubmit:', error);
    }
  });

  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const registerKeywords = register('keywords', {
    maxLength: {
      value: MAX_KEYWORDS_LENGTH,
      message: intl.formatMessage({
        defaultMessage: 'Keywords is too long',
        id: 'SaaS ideas form / Keywords max length error',
      }),
    },
    required: {
      value: true,
      message: intl.formatMessage({
        defaultMessage: 'Keywords is required',
        id: 'SaaS ideas form / Keywords required',
      }),
    },
  });

  const examplePrompts = useMemo(
    () => [
      {
        keywords: ['Recruitment software', 'performance management'],
        label: intl.formatMessage({
          defaultMessage: 'Show me ideas for recruitment & HR SaaS products',
          id: 'SaaS ideas / Example prompt 1',
        }),
      },
      {
        keywords: ['Task management', 'project management'],
        label: intl.formatMessage({
          defaultMessage: 'Show me ideas for project management SaaS products',
          id: 'SaaS ideas / Example prompt 2',
        }),
      },
      {
        keywords: ['Sales automation', 'inventory management'],
        label: intl.formatMessage({
          defaultMessage: 'Show me ideas for sales & inventory SaaS products',
          id: 'SaaS ideas / Example prompt 3',
        }),
      },
    ],
    [intl]
  );

  const handleExampleClick = async (example: { keywords: string[]; label: string }) => {
    console.log('Button click - keywords:', example.keywords);
    const keywordsString = example.keywords.join(', ');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: keywordsString,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await commitGenerateSaasIdeasMutation({
        variables: {
          input: {
            keywords: example.keywords,
          },
        },
      });
    } catch (error) {
      console.error('Mutation error in handleExampleClick:', error);
    }
  };

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'AI Chat - SaaS Ideas Generator',
          id: 'SaaS Ideas / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="SaaS Ideas Generator" id="SaaS ideas / title" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="SaaS idea generator powered by AI. Input keywords related to your desired SaaS product and get personalized, creative SaaS ideas generated by OpenAI."
              id="SaaS ideas / description"
            />
          </Paragraph>
        </div>

        {/* Chat Interface Card */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <FormattedMessage defaultMessage="Chat" id="SaaS ideas / Chat title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Enter keywords separated by commas to generate SaaS ideas"
                id="SaaS ideas / Chat description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Area */}
            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="space-y-4 py-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                        {message.content}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t p-4 flex-shrink-0">
              <Form {...form}>
                <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
                  <FormField
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              {...field}
                              {...registerKeywords}
                              placeholder={intl.formatMessage({
                                defaultMessage: 'Type your keywords here (e.g., project management, CRM...)',
                                id: 'SaaS ideas Form / Keywords placeholder',
                              })}
                              error={errors.keywords?.message}
                              maxLength={MAX_KEYWORDS_LENGTH}
                              disabled={loading || isTyping}
                              className="flex-1"
                            />
                            <Button type="submit" disabled={loading || isTyping} size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {messages.length === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <FormattedMessage defaultMessage="Try these examples:" id="SaaS ideas / Examples label" />
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExampleClick(prompt)}
                            disabled={loading || isTyping}
                            className="text-xs"
                          >
                            {prompt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FormattedMessage defaultMessage="Capabilities" id="SaaS ideas / Capabilities title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="What this AI assistant can do for you"
                id="SaaS ideas / Capabilities description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">
                    <FormattedMessage defaultMessage="Idea Generation" id="SaaS ideas / Capability 1 title" />
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Generate creative and innovative SaaS product ideas based on your keywords"
                    id="SaaS ideas / Capability 1 description"
                  />
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">
                    <FormattedMessage defaultMessage="AI-Powered" id="SaaS ideas / Capability 2 title" />
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Powered by OpenAI's advanced language models for intelligent responses"
                    id="SaaS ideas / Capability 2 description"
                  />
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">
                    <FormattedMessage defaultMessage="Keyword-Based" id="SaaS ideas / Capability 3 title" />
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Simply provide keywords separated by commas to get multiple creative SaaS ideas instantly"
                    id="SaaS ideas / Capability 3 description"
                  />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
