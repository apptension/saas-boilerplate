import { ReactNode } from 'react';

import { BackButton } from '../buttons/backButton';
import { H3, Paragraph } from '../typography';
import { Separator } from '../ui/separator';

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
          <Paragraph firstChildMargin={false} className="text-muted-foreground text-sm">
            {subheader}
          </Paragraph>
        )}
      </div>

      <Separator />
    </>
  );
};
