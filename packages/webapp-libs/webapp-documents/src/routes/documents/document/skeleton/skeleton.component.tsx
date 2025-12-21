import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/ui/skeleton';
import { cn } from '@sb/webapp-core/lib/utils';

export const Skeleton = () => {
  return (
    <li
      className={cn(
        'flex items-center gap-3 p-4',
        'rounded-lg border bg-card text-card-foreground'
      )}
    >
      <div className="flex-shrink-0">
        <SkeletonComponent className="h-12 w-12 rounded-lg" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonComponent className="h-4 w-3/4" />
        <SkeletonComponent className="h-3 w-1/3" />
      </div>
      <SkeletonComponent className="h-8 w-8 rounded-md" />
    </li>
  );
};
