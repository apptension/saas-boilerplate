import { PAGE_SIZE_OPTIONS } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { FormattedMessage } from 'react-intl';

import { PagedPagination, PagedPaginationProps } from '../../pagedPagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export interface TableFooterProps {
  pagination: PagedPaginationProps;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export const TableFooter = ({ pagination, pageSize, onPageSizeChange }: TableFooterProps) => {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex items-center space-x-2">
        <p className="whitespace-nowrap text-sm font-medium">
          <FormattedMessage id="Table Footer / Rows per page" defaultMessage="Rows per page" />
        </p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[4.5rem]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZE_OPTIONS.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PagedPagination {...pagination} />
    </div>
  );
};
