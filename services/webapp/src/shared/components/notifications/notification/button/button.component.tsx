import React from 'react';
import { Button as ButtonBase, ButtonProps } from '../../../button';
import { ButtonSize } from '../../../button/button.types';

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
