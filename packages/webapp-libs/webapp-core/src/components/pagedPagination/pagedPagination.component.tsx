import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC, HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../buttons';

export type PageCursor = {
  cursor?: string | null;
  isCurrent?: boolean | null;
  page?: number | null;
};

export type PageCursors = {
  around?: (PageCursor | null)[] | null | undefined;
  first?: PageCursor | null | undefined;
  last?: PageCursor | null | undefined;
  next?: PageCursor | null | undefined;
  previous?: PageCursor | null | undefined;
};

export type PagedPaginationProps = HTMLAttributes<HTMLDivElement> &
  PageCursors & {
    onPageClick?: (cursor: string) => void;
  };

export interface PageProps {
  pageCursor: PageCursor | null;
  onPageClick?: (cursor: string) => void;
}

const baseButtonProps = {
  variant: 'outline',
  size: 'sm',
} as Partial<ButtonProps>;

const Page = ({ pageCursor = {}, onPageClick }: PageProps) => {
  if (!pageCursor) return;
  const { cursor, page, isCurrent } = pageCursor;
  return (
    <Button
      {...baseButtonProps}
      onClick={() => {
        onPageClick && cursor && onPageClick(cursor);
      }}
      variant={isCurrent ? 'default' : baseButtonProps.variant}
    >
      {page}
    </Button>
  );
};

export const PagedPagination: FC<PagedPaginationProps> = ({
  className,
  around,
  first,
  last,
  next,
  previous,
  onPageClick,
  ...props
}) => {
  return (
    <div {...props} className={cn('flex w-full justify-end gap-2', className)}>
      <Button
        {...baseButtonProps}
        disabled={!previous}
        onClick={() => {
          previous?.cursor && onPageClick && onPageClick(previous.cursor);
        }}
        className="size-9 p-2"
        data-testid="paged-pagination-prev-button"
      >
        <ChevronLeft />
      </Button>

      {first && (
        <>
          <Page pageCursor={first} onPageClick={onPageClick} />
          ...
        </>
      )}

      {around?.map((page) => <Page key={page?.cursor} pageCursor={page} onPageClick={onPageClick} />)}

      {last && (
        <>
          ...
          <Page pageCursor={last} onPageClick={onPageClick} />
        </>
      )}

      <Button
        {...baseButtonProps}
        disabled={!next}
        onClick={() => {
          next?.cursor && onPageClick && onPageClick(next?.cursor);
        }}
        className="size-9 p-2"
        data-testid="paged-pagination-next-button"
      >
        <ChevronRight />
      </Button>
    </div>
  );
};
