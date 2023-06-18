import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/skeleton';

export const Skeleton = () => {
  return (
    <div className="[&>*]:mb-4 [&>*:last-child]:mb-0 flex flex-col items-center border-input border border-input p-6 rounded">
      <SkeletonComponent className="h-5 w-12" />
      <SkeletonComponent className="h-10 w-12" />
      <SkeletonComponent className="h-6 w-32" />
      <SkeletonComponent className="h-6 w-16" />
    </div>
  );
};
