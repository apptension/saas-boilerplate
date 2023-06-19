import { ReactNode } from 'react';

import { BackButton } from '../buttons';
import { Separator } from '../separator';
import { H3, Paragraph } from '../typography';

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
        <H3 className="text-lg font-medium">{header}</H3>

        {subheader && (
          <Paragraph notFirstChildMargin={false} className="text-muted-foreground text-sm">
            {subheader}
          </Paragraph>
        )}
      </div>

      <Separator />
    </>
  );
};