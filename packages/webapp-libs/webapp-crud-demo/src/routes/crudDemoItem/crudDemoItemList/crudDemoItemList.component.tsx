import { gql } from '@sb/webapp-api-client/graphql';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Card, CardContent } from '@sb/webapp-core/components/cards';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Skeleton } from '@sb/webapp-core/components/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemListItem } from './crudDemoItemListItem';
import { usePaginationQuery } from '@sb/webapp-crud-demo/hooks/useCrudDemoPaginatioQuery/useCrudDemoPaginationQuery.hook';

export const crudDemoItemListQuery = gql(/* GraphQL */ `
  query crudDemoItemListQuery($first: Int, $after: String, $last: Int, $before: String) {
    allCrudDemoItems(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          ...crudDemoItemListItem
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`);
export const CRUD_ITEMS_PER_PAGE = 8;

export const CrudDemoItemList = () => {
  const generateLocalePath = useGenerateLocalePath();

  const { data, loading, hasNext, hasPrevious, loadNext, loadPrevious } = usePaginationQuery(crudDemoItemListQuery, {
    hookOptions: {
      variables: {
        first: CRUD_ITEMS_PER_PAGE,
      },
    },
    dataKey: 'allCrudDemoItems',
  });

  const renderList = () => {
    if (data) {
      if (data.allCrudDemoItems && data.allCrudDemoItems.edges.length <= 0) return renderEmptyList();

      return (
        <Card className="mt-4">
          <CardContent>
            <ul className="w-full mt-4 rounded [&>li]:border-b [&>li:last-child]:border-none">
              {mapConnection(
                (node) => (
                  <CrudDemoItemListItem item={node} key={node.id} />
                ),
                data.allCrudDemoItems
              )}
            </ul>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderEmptyList = () => {
    return (
      <Card className="mt-4">
        <CardContent>
          <ul className="flex items-center justify-center w-full mt-4 rounded [&>li]:border-b [&>li]:border-slate-200 [&>li:last-child]:border-none">
            <li className="py-16">
              <h3 className="text-muted-foreground">
                <FormattedMessage id="CrudDemoItemList / Headline" defaultMessage="Empty list" />
              </h3>
            </li>
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage id="CrudDemoItemList / Title" defaultMessage="CRUD Example Items" />}
        subheader={
          <FormattedMessage
            id="CrudDemoItemList / Subheader"
            defaultMessage="Interactive CRUD example to explore and understand features"
          />
        }
      />

      <Link
        to={generateLocalePath(RoutesConfig.crudDemoItem.add)}
        variant={ButtonVariant.PRIMARY}
        icon={<PlusCircle className="mr-2 h-4 w-4" />}
      >
        <FormattedMessage id="CrudDemoItemList / Add new" defaultMessage="Add new item" />
      </Link>

      {loading ? (
        <Card>
          <CardContent>
            <ul className="w-full mt-4 rounded [&>li]:border-b [&>li:last-child]:border-none">
              <li className="py-16">
                <div className="flex items-center justify-between w-full min-w-15 p-4">
                  <Skeleton className="w-48 h-4" />
                  <div className="flex ml-3 shrink-0 [&>*]:mr-4 [&>*:last-child]:mr-0">
                    <Skeleton className="w-16 h-8" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
              </li>

              <li className="py-16">
                <div className="flex items-center justify-between w-full min-w-15 p-4">
                  <Skeleton className="w-64 h-4" />
                  <div className="flex ml-3 shrink-0 [&>*]:mr-4 [&>*:last-child]:mr-0">
                    <Skeleton className="w-16 h-8" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderList()}
          <div className="flex justify-end w-full gap-4">
            <Button
              disabled={hasPrevious}
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
        </>
      )}
    </PageLayout>
  );
};
