import { Button } from '@sb/webapp-core/components/buttons';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { ReactElement } from 'react';

type ButtonProps = {
  onClick: () => void;
  buttonText: string;
  children?: never;
};

type CustomButton = {
  children: ReactElement;
  onClick?: never;
  buttonText?: never;
};

type RestProps = ButtonProps | CustomButton;

export type DangerZoneItemProps = {
  title: string;
  subtitle?: string;
  disabled?: boolean;
} & RestProps;

export const DangerZoneItem = ({
  title,
  subtitle,
  disabled = false,
  onClick,
  buttonText,
  children,
}: DangerZoneItemProps) => {
  return (
    <div>
      <div className="flex justify-between">
        <span>
          {title}
          <Paragraph className="text-sm text-slate-400">{subtitle}</Paragraph>
        </span>

        {children ?? (
          <Button onClick={onClick} disabled={disabled} variant="destructive">
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};
