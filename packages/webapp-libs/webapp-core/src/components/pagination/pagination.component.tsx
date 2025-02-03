import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC } from 'react';

import { Button } from '../buttons';

export type PaginationProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  loadPrevious: () => void;
  loadNext: () => void;
};

export const Pagination: FC<PaginationProps> = ({ hasNext, hasPrevious, loadNext, loadPrevious }) => {
  return (
    <div className="flex w-full justify-end gap-4">
      <Button
        data-testid="previous-button"
        disabled={!hasPrevious}
        variant="outline"
        onClick={() => {
          loadPrevious();
        }}
      >
        <ChevronLeft />
      </Button>
      <Button
        disabled={!hasNext}
        variant="outline"
        data-testid="next-button"
        onClick={() => {
          loadNext();
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};
