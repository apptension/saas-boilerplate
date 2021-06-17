import { css } from 'styled-components';

export const primaryEasing = 'ease-in';
export const primaryDuration = '.2s';
export const primary = `${primaryDuration} ${primaryEasing}`;

interface VisibilityAnimationArgs {
  isVisible?: boolean;
  duration?: string;
  easing?: string;
  properties: { name: string; valueWhenVisible: string; valueWhenHidden: string }[];
}

export const withVisibility = ({
  isVisible = true,
  duration = primaryDuration,
  easing = primaryEasing,
  properties = [],
}: VisibilityAnimationArgs) => css`
  visibility: ${isVisible ? 'visible' : 'hidden'};
  ${properties
    .map(({ name, valueWhenVisible, valueWhenHidden }) => `${name}: ${isVisible ? valueWhenVisible : valueWhenHidden}`)
    .join('\n')};
  transition: ${[
    ...properties.map(({ name }) => `${name} ${duration} ${easing}`),
    `visibility ${duration} ${easing} ${isVisible ? '0s' : duration}`,
  ].join(',')};
`;
