import { AtSign } from 'lucide-react';
import React from 'react';

/**
 * Render mentions in text (format: @[userId:userName])
 * Converts @[userId:userName] patterns to styled mention badges
 */
export const renderMentions = (text: string): React.ReactNode => {
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

/**
 * Check if text contains any mentions
 */
export const hasMentions = (text: string): boolean => {
  const mentionPattern = /@\[([^\]]+)\]/g;
  return mentionPattern.test(text);
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
