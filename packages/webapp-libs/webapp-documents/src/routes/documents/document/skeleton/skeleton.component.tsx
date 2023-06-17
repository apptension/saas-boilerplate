import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/skeleton';
import LoadingSkeleton from 'react-loading-skeleton';

export const Skeleton = () => {
  return (
    <div className="[&>*]:mb-4">
      <SkeletonComponent className="h-6 w-12" />
      <SkeletonComponent className="h-12 w-12" />
      <SkeletonComponent className="h-7 w-32" />
      <SkeletonComponent className="h-7 w-18" />
      {/* <LoadingSkeleton height={14} width={50} />
      <LoadingSkeleton height={30} width={30} />
      <LoadingSkeleton height={16} width={120} />
      <LoadingSkeleton height={16} width={60} /> */}
    </div>
  );
};
