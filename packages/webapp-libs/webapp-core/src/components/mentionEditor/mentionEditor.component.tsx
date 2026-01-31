import { useQuery } from '@apollo/client/react';
import { Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { cn } from '../../lib/utils';
import { MarkdownEditor, MarkdownEditorProps } from '../markdownEditor/markdownEditor.component';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { tenantMembersForMentionsQuery } from './mentionEditor.graphql';

export interface MentionEditorProps extends Omit<MarkdownEditorProps, 'onChange'> {
  onChange: (value: string) => void;
  tenantId: string;
}

interface MentionMatch {
  start: number;
  end: number;
  query: string;
}

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

const MENTION_REGEX = /@(\w*)$/;
const MENTION_PATTERN = /@\[([^:]+):([^\]]+)\]/g;

/**
 * Get initials from a full name (up to 2 characters)
 */
const getInitials = (fullName: string): string => {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Extract mention query from text at cursor position
 */
const getMentionMatch = (text: string, cursorPosition: number): MentionMatch | null => {
  const textBeforeCursor = text.substring(0, cursorPosition);
  const match = textBeforeCursor.match(MENTION_REGEX);
  
  if (!match || match.index === undefined) {
    return null;
  }

  return {
    start: match.index,
    end: cursorPosition,
    query: match[1] || '',
  };
};

/**
 * Insert mention into text at position
 */
const insertMention = (text: string, position: number, userId: string, userName: string): string => {
  const before = text.substring(0, position);
  const after = text.substring(position);
  
  // Remove the @ and query text
  const mentionMatch = before.match(MENTION_REGEX);
  if (mentionMatch && mentionMatch.index !== undefined) {
    const beforeMention = before.substring(0, mentionMatch.index);
    const mentionText = `@[${userId}:${userName}]`;
    return beforeMention + mentionText + after;
  }
  
  return text;
};

export const MentionEditor = forwardRef<HTMLTextAreaElement, MentionEditorProps>(
  ({ value, onChange, tenantId, ...markdownEditorProps }, ref) => {
    const intl = useIntl();
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [mentionMatch, setMentionMatch] = useState<MentionMatch | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMentions, setShowMentions] = useState(false);
    const mentionDropdownRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => editorRef.current as HTMLTextAreaElement);

    // Query tenant members for mentions
    const { data: membersData, loading: membersLoading } = useQuery(tenantMembersForMentionsQuery, {
      variables: { tenantId },
      skip: !tenantId || !showMentions,
    });

    const members: MentionUser[] = membersData?.tenant?.userMemberships
      ?.filter((m: any) => m.invitationAccepted && m.userId)
      ?.map((m: any) => ({
        id: m.userId,
        firstName: m.firstName || '',
        lastName: m.lastName || '',
        email: m.userEmail || '',
        avatar: m.avatar,
      })) || [];

    // Filter members based on query
    const filteredMembers = mentionMatch
      ? members.filter((member) => {
          const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
          const email = member.email.toLowerCase();
          const query = mentionMatch.query.toLowerCase();
          return fullName.includes(query) || email.includes(query);
        })
      : members;

    // Handle text change and detect @ mentions
    const handleChange = useCallback(
      (newValue: string) => {
        onChange(newValue);

        if (!editorRef.current) return;

        const cursorPosition = editorRef.current.selectionStart;
        const match = getMentionMatch(newValue, cursorPosition);

        if (match) {
          setMentionMatch(match);
          setShowMentions(true);
          setSelectedIndex(0);
        } else {
          setShowMentions(false);
          setMentionMatch(null);
        }
      },
      [onChange]
    );

    // Handle mention selection
    const handleSelectMention = useCallback(
      (member: MentionUser) => {
        if (!editorRef.current || !mentionMatch) return;

        const userName = `${member.firstName} ${member.lastName}`.trim() || member.email;
        const newValue = insertMention(value, mentionMatch.end, member.id, userName);
        
        onChange(newValue);
        setShowMentions(false);
        setMentionMatch(null);
        setSelectedIndex(0);

        // Set cursor position after mention
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const mentionText = `@[${member.id}:${userName}]`;
            const newPosition = mentionMatch.start + mentionText.length;
            editorRef.current.focus();
            editorRef.current.setSelectionRange(newPosition, newPosition);
          }
        });
      },
      [value, mentionMatch, onChange]
    );

    // Handle keyboard navigation in mention dropdown
    useEffect(() => {
      const textarea = editorRef.current;
      if (!textarea) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (showMentions && filteredMembers.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < filteredMembers.length - 1 ? prev + 1 : 0));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredMembers.length - 1));
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (filteredMembers[selectedIndex]) {
              handleSelectMention(filteredMembers[selectedIndex]);
            }
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setShowMentions(false);
            setMentionMatch(null);
            return;
          }
        }
      };

      textarea.addEventListener('keydown', handleKeyDown);
      return () => {
        textarea.removeEventListener('keydown', handleKeyDown);
      };
    }, [showMentions, filteredMembers, selectedIndex, handleSelectMention]);

    // Calculate dropdown position
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

    const updateDropdownPosition = useCallback(() => {
      if (!showMentions || !editorRef.current || !mentionMatch) {
        setDropdownPosition(null);
        return;
      }

      const textarea = editorRef.current;
      const textBeforeCursor = value.substring(0, mentionMatch.start);
      const textareaRect = textarea.getBoundingClientRect();
      const styles = window.getComputedStyle(textarea);
      
      try {
        // Create a mirror div positioned at the same location as the textarea
        const mirror = document.createElement('div');
        
        // Copy all relevant styles to match textarea rendering
        mirror.style.position = 'fixed';
        mirror.style.top = `${textareaRect.top}px`;
        mirror.style.left = `${textareaRect.left}px`;
        mirror.style.width = `${textarea.clientWidth}px`;
        mirror.style.height = 'auto';
        mirror.style.whiteSpace = 'pre-wrap';
        mirror.style.wordWrap = 'break-word';
        mirror.style.overflowWrap = 'break-word';
        mirror.style.font = styles.font;
        mirror.style.fontSize = styles.fontSize;
        mirror.style.fontFamily = styles.fontFamily;
        mirror.style.fontWeight = styles.fontWeight;
        mirror.style.lineHeight = styles.lineHeight;
        mirror.style.letterSpacing = styles.letterSpacing;
        mirror.style.paddingTop = styles.paddingTop;
        mirror.style.paddingRight = styles.paddingRight;
        mirror.style.paddingBottom = styles.paddingBottom;
        mirror.style.paddingLeft = styles.paddingLeft;
        mirror.style.borderWidth = styles.borderWidth;
        mirror.style.borderStyle = 'solid';
        mirror.style.borderColor = 'transparent';
        mirror.style.boxSizing = styles.boxSizing;
        mirror.style.visibility = 'hidden';
        mirror.style.pointerEvents = 'none';
        mirror.style.zIndex = '-1';
        mirror.style.overflow = 'hidden';
        
        // Create content with a marker span at the @ position
        const textContent = textBeforeCursor.replace(/\n/g, '<br>');
        mirror.innerHTML = `${textContent}<span id="mention-marker">@</span>`;
        
        document.body.appendChild(mirror);
        
        // Get the marker position
        const marker = document.getElementById('mention-marker');
        
        if (marker) {
          const markerRect = marker.getBoundingClientRect();
          
          // Calculate position accounting for textarea scroll
          const scrollTop = textarea.scrollTop;
          const lineHeight = parseFloat(styles.lineHeight) || 20;
          
          // Position dropdown below the @ symbol
          let top = markerRect.top + lineHeight + 4 - scrollTop;
          let left = markerRect.left;
          
          // Make sure dropdown stays within viewport
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          const dropdownHeight = 280; // Approximate max height
          const dropdownWidth = 256; // w-64 = 16rem = 256px
          
          // If dropdown would go below viewport, position it above the cursor
          if (top + dropdownHeight > viewportHeight) {
            top = markerRect.top - dropdownHeight - 4;
          }
          
          // If dropdown would go off right edge, align to right edge of viewport
          if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8;
          }
          
          // Ensure left is not negative
          if (left < 8) {
            left = 8;
          }
          
          document.body.removeChild(mirror);
          
          // Validate position values
          if (isFinite(top) && isFinite(left) && top > 0) {
            setDropdownPosition({ top, left });
          } else {
            // Fallback: position below textarea start
            setDropdownPosition({ 
              top: textareaRect.top + parseFloat(styles.paddingTop) + lineHeight + 4, 
              left: textareaRect.left + parseFloat(styles.paddingLeft)
            });
          }
        } else {
          document.body.removeChild(mirror);
          // Fallback: position below textarea start
          const lineHeight = parseFloat(styles.lineHeight) || 20;
          setDropdownPosition({ 
            top: textareaRect.top + parseFloat(styles.paddingTop) + lineHeight + 4, 
            left: textareaRect.left + parseFloat(styles.paddingLeft)
          });
        }
      } catch (error) {
        // Fallback: position at textarea start if calculation fails
        const lineHeight = parseFloat(styles.lineHeight) || 20;
        setDropdownPosition({ 
          top: textareaRect.top + parseFloat(styles.paddingTop) + lineHeight + 4, 
          left: textareaRect.left + parseFloat(styles.paddingLeft)
        });
      }
    }, [showMentions, mentionMatch, value]);

    useEffect(() => {
      if (showMentions && editorRef.current) {
        // Calculate position when mentions are shown
        updateDropdownPosition();
      } else {
        setDropdownPosition(null);
      }
    }, [showMentions, updateDropdownPosition]);

    // Update position on scroll
    useEffect(() => {
      if (!showMentions || !editorRef.current) return;

      const textarea = editorRef.current;
      const handleScroll = () => {
        updateDropdownPosition();
      };

      textarea.addEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);

      return () => {
        textarea.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }, [showMentions, updateDropdownPosition]);

    // Close mentions when clicking outside
    useEffect(() => {
      if (!showMentions) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          mentionDropdownRef.current &&
          !mentionDropdownRef.current.contains(e.target as Node) &&
          editorRef.current &&
          !editorRef.current.contains(e.target as Node)
        ) {
          setShowMentions(false);
          setMentionMatch(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMentions]);

    return (
      <div className="relative">
        <MarkdownEditor
          {...markdownEditorProps}
          ref={editorRef}
          value={value}
          onChange={handleChange}
        />
        
        {showMentions && typeof document !== 'undefined' && (dropdownPosition ? createPortal(
          <div
            ref={mentionDropdownRef}
            className="fixed z-50 w-64 rounded-md border bg-popover shadow-md"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {membersLoading ? (
              <div className="p-2 text-sm text-muted-foreground">
                <FormattedMessage defaultMessage="Loading..." id="MentionEditor / Loading" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                <FormattedMessage defaultMessage="No matches found" id="MentionEditor / No Matches" />
              </div>
            ) : (
              <div className="max-h-64 overflow-auto p-1">
                {filteredMembers.map((member, index) => {
                  const fullName = `${member.firstName} ${member.lastName}`.trim() || member.email;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-left',
                        'hover:bg-accent transition-colors',
                        isSelected && 'bg-accent'
                      )}
                      onClick={() => handleSelectMention(member)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Avatar className="h-6 w-6 shrink-0">
                        {member.avatar && <AvatarImage src={member.avatar} alt={fullName} />}
                        <AvatarFallback className="bg-muted text-xs font-medium">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{fullName}</div>
                        <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          document.body
        ) : null)}
      </div>
    );
  }
);

MentionEditor.displayName = 'MentionEditor';
