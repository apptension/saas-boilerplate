import { cn } from '../../lib/utils';

export const PageLayout = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('flex-1 space-y-8 px-4 sm:px-6 lg:px-8', className)} {...props} />;
};
