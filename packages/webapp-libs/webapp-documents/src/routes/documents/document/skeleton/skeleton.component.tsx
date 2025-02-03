import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/ui/skeleton';

export const Skeleton = () => {
  return (
    <li className="flex items-center justify-between px-3 py-6 rounded border border-input">
      <div className="w-fit h-fit">
        <SkeletonComponent className="h-12 w-12" />
      </div>
      <div className="flex justify-center w-[100%] flex-col px-4 max-w-[100%]">
        <SkeletonComponent className="mb-1 h-5 w-[100%]" />

        <SkeletonComponent className="h-4 w-8 w-[40%]" />
      </div>
      <SkeletonComponent className="h-8 w-8" />
    </li>
  );
};
