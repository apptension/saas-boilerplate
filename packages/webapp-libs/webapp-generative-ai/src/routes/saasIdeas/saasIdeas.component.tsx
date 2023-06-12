import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { typography } from '@sb/webapp-core/theme';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import LoadingSkeleton from 'react-loading-skeleton';
import Typewriter from 'typewriter-effect/dist/core';

import { generateSaasIdeasMutation } from './saasIdeas.graphql';
import { Container, Field, List, ListItem, Title } from './saasIdeas.styles';

const MAX_KEYWORDS_LENGTH = 200;

export const SaasIdeas = () => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const {
    form: {
      register,
      formState: { errors },
      handleSubmit,
    },
  } = useApiForm({
    defaultValues: {
      keywords: '',
    },
  });

  const [commitGenerateSaasIdeasMutation, { data, loading }] = useMutation(generateSaasIdeasMutation, {
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await commitGenerateSaasIdeasMutation({
      variables: {
        input: {
          keywords: data.keywords.split(',').map((keyword) => keyword.trim()),
        },
      },
    });
    return;
  });

  const placeholders = useMemo(
    () => [
      intl.formatMessage({
        defaultMessage: 'Recruitment software, performance management...',
        id: 'SaaS ideas form / Keywords recruitment and performance placeholder ',
      }),
      intl.formatMessage({
        defaultMessage: 'Task management, project management...',
        id: 'SaaS ideas form / Keywords task and project management placeholder',
      }),
      intl.formatMessage({
        defaultMessage: 'Sales automation, inventory management...',
        id: 'SaaS ideas form / Keywords sales and inventory placeholder',
      }),
      intl.formatMessage({
        defaultMessage: 'Time tracking, accounting and finance...',
        id: 'SaaS ideas form / Keywords time tracking and finance placeholder',
      }),
    ],
    [intl]
  );

  const handleCreateTextNode = (character: string) => {
    if (inputRef.current) {
      inputRef.current.placeholder = inputRef.current.placeholder + character;
    }

    return null;
  };

  const handleRemoveNode = () => {
    if (inputRef.current && inputRef.current.placeholder) {
      inputRef.current.placeholder = inputRef.current.placeholder.slice(0, -1);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      const instance = new Typewriter(inputRef.current, {
        strings: placeholders,
        autoStart: true,
        loop: true,
        onCreateTextNode: handleCreateTextNode,
        onRemoveNode: handleRemoveNode,
      });
      return () => {
        instance.stop();
      };
    }
    return () => {
      return null;
    };
  }, [placeholders, inputRef]);

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
  return (
    <Container>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'SaaS Ideas',
          id: 'SaaS Ideas / page title',
        })}
      />

      <Title>
        <FormattedMessage defaultMessage="Generate your SaaS ideas using chatGPT!" id="SaaS ideas / title" />
      </Title>

      <typography.Paragraph>
        <FormattedMessage
          defaultMessage="SaaS idea generator powered by AI. Input a keyword and get personalized SaaS ideas."
          id="SaaS ideas / description"
        />
      </typography.Paragraph>

      <form onSubmit={handleFormSubmit} noValidate={true}>
        <Field>
          <Input
            {...registerKeywords}
            label={intl.formatMessage({
              defaultMessage: 'Keywords:',
              id: 'SaaS ideas Form / Keywords label',
            })}
            error={errors.keywords?.message}
            ref={(e) => {
              registerKeywords.ref(e);
              inputRef.current = e;
            }}
            maxLength={MAX_KEYWORDS_LENGTH}
          />
        </Field>

        <Button type="submit" disabled={loading}>
          <FormattedMessage defaultMessage="Generate your SaaS ideas" id="SaaS ideas form / Submit button" />
        </Button>
      </form>

      <List>
        {loading ? (
          <ListItem>
            <LoadingSkeleton height={8} width={480} />
            <LoadingSkeleton height={8} width={460} />
            <LoadingSkeleton height={8} width={480} />
            <LoadingSkeleton height={8} width={400} />
          </ListItem>
        ) : (
          data?.generateSaasIdeas?.ideas?.map((idea, index) => <ListItem key={index}>{idea}</ListItem>)
        )}
      </List>
    </Container>
  );
};
