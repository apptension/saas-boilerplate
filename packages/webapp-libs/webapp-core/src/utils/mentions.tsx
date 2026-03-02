import { AtSign } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge } from '../components/ui/badge';

const MENTION_PATTERN = /@\[([^\]]+)\]/g;

/**
 * Extract display name from mention content (userId:userName or userId:email)
 */
const getMentionDisplayName = (mentionContent: string): string | null => {
  const colonIndex = mentionContent.indexOf(':');
  const userName = colonIndex > 0 ? mentionContent.substring(colonIndex + 1) : mentionContent;
  if (userName === 'object Object' || userName === '[object Object]' || !userName.trim()) {
    return null;
  }
  return userName.trim();
};

/**
 * Render mentions in text (format: @[userId:userName] or @[userId:email])
 * Converts @[userId:userName] patterns to styled mention chips
 */
export const renderMentions = (text: string): React.ReactNode => {
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  MENTION_PATTERN.lastIndex = 0;
  while ((match = MENTION_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const displayName = getMentionDisplayName(match[1]);
    if (displayName) {
      // Add mention chip (Badge for pill-shaped, distinct styling)
      parts.push(
        <Badge
          key={key++}
          variant="secondary"
          className="inline-flex items-center gap-1 px-2 py-0.5 font-medium normal-case"
        >
          <AtSign className="h-3 w-3 shrink-0" />
          {displayName}
        </Badge>
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

/** Placeholder format - code spans preserve content through markdown parsing */
const MENTION_PLACEHOLDER = (idx: number) => `\`__SB_MENTION_${idx}__\``;

/**
 * Pre-process content: replace @[id:name] with code-span placeholders before markdown parses.
 * This prevents remark-gfm from autolinking emails inside mentions.
 */
const processMentionsForMarkdown = (
  content: string
): { processedContent: string; displayNames: string[] } => {
  const displayNames: string[] = [];
  const parts: string[] = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  MENTION_PATTERN.lastIndex = 0;
  while ((match = MENTION_PATTERN.exec(content)) !== null) {
    parts.push(content.substring(lastIndex, match.index));
    const displayName = getMentionDisplayName(match[1]);
    if (displayName) {
      displayNames.push(displayName);
      parts.push(MENTION_PLACEHOLDER(idx));
      idx++;
    } else {
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }
  parts.push(content.substring(lastIndex));

  return { processedContent: parts.join(''), displayNames };
};

const CODE_PLACEHOLDER_REGEX = /^__SB_MENTION_(\d+)__$/;

/**
 * Render markdown with mentions as chips. Replaces mentions with code-span placeholders
 * before parsing so emails in @[id:email] are not autolinked by remark-gfm.
 */
export const renderMarkdownWithMentions = (
  content: string,
  markdownClassName?: string
): React.ReactElement => {
  const { processedContent, displayNames } = processMentionsForMarkdown(content);

  const codeComponent = ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'code'>) => {
    const text = typeof children === 'string' ? children : String(children ?? '');
    const match = text.match(CODE_PLACEHOLDER_REGEX);
    if (match) {
      const displayName = displayNames[parseInt(match[1], 10)];
      if (displayName) {
        return (
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-1 px-2 py-0.5 font-medium normal-case align-baseline"
          >
            <AtSign className="h-3 w-3 shrink-0" />
            {displayName}
          </Badge>
        );
      }
    }
    return <code {...props}>{children}</code>;
  };

  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: codeComponent }}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Check if text contains any mentions
 */
export const hasMentions = (text: string): boolean => {
  MENTION_PATTERN.lastIndex = 0;
  return MENTION_PATTERN.test(text);
};

/**
 * Extract mention user IDs from text
 */
export const extractMentionUserIds = (text: string): string[] => {
  const mentionPattern = /@\[([^:]+):([^\]]+)\]/g;
  const userIds: string[] = [];
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    userIds.push(match[1]);
  }

  return userIds;
};

/**
 * Strip mention formatting from text, leaving just the names
 */
export const stripMentionFormatting = (text: string): string => {
  return text.replace(/@\[([^:]+):([^\]]+)\]/g, '@$2');
};
