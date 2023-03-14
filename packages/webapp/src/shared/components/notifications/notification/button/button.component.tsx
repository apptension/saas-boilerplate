import { Button as ButtonBase, ButtonProps, ButtonSize } from '@saas-boilerplate-app/webapp-core/components/buttons';

export const Button = ({ onClick, ...props }: ButtonProps) => {
  return (
    <ButtonBase
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      size={ButtonSize.SMALL}
      {...props}
    />
  );
};
