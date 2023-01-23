import { Button as ButtonBase, ButtonProps } from '../../../forms/button';
import { ButtonSize } from '../../../forms/button/button.types';

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
