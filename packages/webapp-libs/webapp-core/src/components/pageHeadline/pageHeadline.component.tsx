import { ReactNode } from 'react';

import { BackButton } from '../buttons';
import { Separator } from '../separator';

export type PageHeadlineProps = {
  hasBackButton?: boolean;
  header: ReactNode;
  subheader?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const PageHeadline = ({ hasBackButton = false, header, subheader, ...props }: PageHeadlineProps) => {
  return (
    <>
      <div {...props}>
        {hasBackButton ? <BackButton className="float-right" /> : null}
        <h3 className="text-lg font-medium">{header}</h3>

        {subheader && <p className="text-muted-foreground text-sm">{subheader}</p>}
      </div>

      <Separator />
    </>
  );
};
