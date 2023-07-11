import { Button } from '@sb/webapp-core/components/buttons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC } from 'react';

export type PaginationProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  loadPrevious: () => void;
  loadNext: () => void;
};

export const Pagination: FC<PaginationProps> = ({ hasNext, hasPrevious, loadNext, loadPrevious }) => {
  return (
    <div className="flex justify-end w-full gap-4">
      <Button
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
        onClick={() => {
          loadNext();
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};
