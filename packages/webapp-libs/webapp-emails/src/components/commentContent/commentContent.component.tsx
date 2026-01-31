import React from 'react';

/**
 * Render mentions in text (format: @[userId:userName])
 */
const renderMentions = (text: string): (string | React.ReactElement)[] => {
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

    // Add mention badge (email-safe styling)
    parts.push(
      <span
        key={key++}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: '#e0e7ff',
          color: '#4338ca',
          fontWeight: '500',
          fontSize: '14px',
        }}
      >
        @{userName}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

/**
 * Simple markdown parser for email-safe rendering
 */
const parseMarkdown = (
  text: string,
  fontFamily: string,
  fontSize: string,
  textColor: string,
  headingColor: string
): React.ReactElement[] => {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        React.createElement(
          ListTag,
          {
            key: key++,
            style: {
              fontFamily,
              fontSize,
              color: textColor,
              margin: '8px 0',
              paddingLeft: '20px',
              textAlign: 'left',
            },
          },
          listItems.map((item, idx) =>
            React.createElement('li', {
              key: idx,
              style: {
                fontFamily,
                fontSize,
                color: textColor,
                margin: '4px 0',
                textAlign: 'left',
              },
            }, renderMentions(item.trim()))
          )
        )
      );
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        React.createElement('h3', {
          key: key++,
          style: {
            fontFamily,
            fontSize: '18px',
            fontWeight: '600',
            margin: '10px 0 5px 0',
            textAlign: 'left',
            color: headingColor,
            lineHeight: '1.25',
          },
        }, renderMentions(trimmed.slice(4)))
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        React.createElement('h2', {
          key: key++,
          style: {
            fontFamily,
            fontSize: '20px',
            fontWeight: '600',
            margin: '12px 0 6px 0',
            textAlign: 'left',
            color: headingColor,
            lineHeight: '1.25',
          },
        }, renderMentions(trimmed.slice(3)))
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        React.createElement('h1', {
          key: key++,
          style: {
            fontFamily,
            fontSize: '24px',
            fontWeight: '600',
            margin: '16px 0 8px 0',
            textAlign: 'left',
            color: headingColor,
            lineHeight: '1.25',
          },
        }, renderMentions(trimmed.slice(2)))
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(React.createElement('hr', { key: key++, style: { margin: '16px 0', border: 'none', borderTop: '1px solid #e5e5e5' } }));
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        React.createElement(
          'blockquote',
          {
            key: key++,
            style: {
              fontFamily,
              fontSize,
              borderLeft: '4px solid #d1d5db',
              paddingLeft: '12px',
              margin: '8px 0',
              color: '#6b7280',
              textAlign: 'left',
            },
          },
          renderMentions(trimmed.slice(2))
        )
      );
      continue;
    }

    // Lists
    const listMatch = trimmed.match(/^(\d+\.|\*|\-|\+)\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        listType = /^\d+\./.test(listMatch[1]) ? 'ol' : 'ul';
        inList = true;
      }
      listItems.push(listMatch[2]);
      continue;
    }

    // Flush list if we hit a non-list item
    if (inList && trimmed) {
      flushList();
    }

    // Code block
    if (trimmed.startsWith('```')) {
      flushList();
      // Skip code blocks for now (would need multi-line handling)
      continue;
    }

    // Regular paragraph
    if (trimmed) {
      // Process inline markdown
      let processed = trimmed;
      const processedParts: (string | React.ReactElement)[] = [];
      let lastIdx = 0;

      // Bold **text**
      processed = processed.replace(/\*\*([^*]+)\*\*/g, (match, text, offset) => {
        processedParts.push(processed.substring(lastIdx, offset));
        processedParts.push(React.createElement('strong', { key: `bold-${key++}`, style: { fontWeight: '600' } }, text));
        lastIdx = offset + match.length;
        return '';
      });

      // Italic _text_ or *text*
      processed = processed.replace(/(?<!\*)_([^_]+)_(?!\*)|(?<!\*)\*([^*]+)\*(?!\*)/g, (match, text1, text2, offset) => {
        const text = text1 || text2;
        processedParts.push(processed.substring(lastIdx, offset));
        processedParts.push(React.createElement('em', { key: `em-${key++}`, style: { fontStyle: 'italic' } }, text));
        lastIdx = offset + match.length;
        return '';
      });

      // Inline code `code`
      processed = processed.replace(/`([^`]+)`/g, (match, code, offset) => {
        processedParts.push(processed.substring(lastIdx, offset));
        processedParts.push(
          React.createElement('code', {
            key: `code-${key++}`,
            style: {
              fontFamily,
              backgroundColor: '#e5e5e5',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '14px',
            },
          }, code)
        );
        lastIdx = offset + match.length;
        return '';
      });

      processedParts.push(processed.substring(lastIdx));

      // Process mentions in the processed parts
      const finalParts = processedParts.flatMap((part) => (typeof part === 'string' ? renderMentions(part) : [part]));

      elements.push(
        React.createElement('p', {
          key: key++,
          style: {
            fontFamily,
            fontSize,
            color: textColor,
            margin: '8px 0',
            lineHeight: '1.5',
            textAlign: 'left',
          },
        }, finalParts)
      );
    } else {
      // Empty line
      flushList();
      if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
        elements.push(React.createElement('br', { key: key++ }));
      }
    }
  }

  flushList();

  return elements;
};

export type CommentContentProps = {
  content: string;
};

/**
 * Component to render comment content with markdown and mentions
 * Email-safe rendering with inline styles (no browser DOM APIs)
 */
export const CommentContent = ({ content }: CommentContentProps) => {
  // Base font styling matching email template
  const baseFontFamily = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const baseFontSize = '16px';
  const baseColor = '#64748B';
  const headingColor = '#0F172A';

  // Update parseMarkdown to use consistent styling
  const elements = parseMarkdown(content, baseFontFamily, baseFontSize, baseColor, headingColor);

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        margin: '16px 0',
        fontFamily: baseFontFamily,
        fontSize: baseFontSize,
        lineHeight: '1.5',
        color: baseColor,
        textAlign: 'left',
      }}
    >
      {elements.length > 0 ? elements : (
        <p style={{ fontFamily: baseFontFamily, fontSize: baseFontSize, color: baseColor, textAlign: 'left', margin: 0 }}>
          {renderMentions(content)}
        </p>
      )}
    </div>
  );
};
