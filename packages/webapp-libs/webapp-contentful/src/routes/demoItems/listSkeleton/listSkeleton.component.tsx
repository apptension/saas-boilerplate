import { Card, CardContent, CardHeader } from '@sb/webapp-core/components/ui/card';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';

export const ListSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="p-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};


