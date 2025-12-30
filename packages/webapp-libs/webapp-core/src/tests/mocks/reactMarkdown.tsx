import React from 'react';

// Mock for react-markdown ESM module for Jest compatibility
// This provides basic markdown parsing for common elements used in tests
const ReactMarkdown = ({ children }: { children: string }) => {
  const lines = children.split('\n').filter((line) => line.trim());

  const elements = lines.map((line, index) => {
    // Parse headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag key={index}>{headingMatch[2]}</Tag>;
    }

    // Parse unordered list items
    const ulMatch = line.match(/^\s*[\*\-]\s+(.+)$/);
    if (ulMatch) {
      return { type: 'ul', content: ulMatch[1].trim(), key: index };
    }

    // Parse ordered list items
    const olMatch = line.match(/^\s*\d+[\.\)]\s+(.+)$/);
    if (olMatch) {
      return { type: 'ol', content: olMatch[1].trim(), key: index };
    }

    // Default to paragraph
    return <p key={index}>{line}</p>;
  });

  // Group list items
  const result: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: { content: string; key: number }[] } | null = null;

  elements.forEach((el) => {
    if (typeof el === 'object' && el !== null && 'type' in el && (el.type === 'ul' || el.type === 'ol')) {
      if (currentList && currentList.type === el.type) {
        currentList.items.push({ content: el.content, key: el.key });
      } else {
        if (currentList) {
          const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
          result.push(
            <ListTag key={`list-${currentList.items[0].key}`}>
              {currentList.items.map((item) => (
                <li key={item.key}>{item.content}</li>
              ))}
            </ListTag>
          );
        }
        currentList = { type: el.type, items: [{ content: el.content, key: el.key }] };
      }
    } else {
      if (currentList) {
        const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
        result.push(
          <ListTag key={`list-${currentList.items[0].key}`}>
            {currentList.items.map((item) => (
              <li key={item.key}>{item.content}</li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
      result.push(el as React.ReactNode);
    }
  });

  // Don't forget remaining list
  if (currentList) {
    const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
    result.push(
      <ListTag key={`list-${currentList.items[0].key}`}>
        {currentList.items.map((item) => (
          <li key={item.key}>{item.content}</li>
        ))}
      </ListTag>
    );
  }

  return <>{result}</>;
};

export default ReactMarkdown;
