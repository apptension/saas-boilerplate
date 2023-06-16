import { HtmlHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type HeadingProps = HtmlHTMLAttributes<HTMLHeadElement>;

export const H1 = forwardRef<HTMLHeadElement, HeadingProps>(({ children, className, ...props }) => {
  return (
    <h1 {...props} className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}>
      {children}
    </h1>
  );
});

export const H2 = forwardRef<HTMLHeadElement, HeadingProps>(({ children, className, ...props }) => {
  return (
    <h2 {...props} className={cn('tracking-tight" scroll-m-20 text-3xl font-semibold', className)}>
      {children}
    </h2>
  );
});

export const H3 = forwardRef<HTMLHeadElement, HeadingProps>(({ children, className, ...props }) => {
  return (
    <h3 {...props} className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
});

export const H4 = forwardRef<HTMLHeadElement, HeadingProps>(({ children, className, ...props }) => {
  return (
    <h4 {...props} className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}>
      {children}
    </h4>
  );
});

export type ParagraphProps = HtmlHTMLAttributes<HTMLParagraphElement> & {
  notFirstChildMargin?: boolean;
};

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ children, className, notFirstChildMargin = true, ...props }) => {
    return (
      <p {...props} className={cn(`leading-7 ${notFirstChildMargin ? '[&:not(:first-child)]:mt-6' : null}`, className)}>
        {children}
      </p>
    );
  }
);

export const ParagraphBold = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ children, className, notFirstChildMargin, ...props }) => {
    return (
      <p
        {...props}
        className={cn(
          `font-semibold leading-7 ${notFirstChildMargin ? '[&:not(:first-child)]:mt-6' : null}`,
          className
        )}
      >
        {children}
      </p>
    );
  }
);

export type SmallProps = HtmlHTMLAttributes<HTMLElement>;

export const Small = forwardRef<HTMLElement, SmallProps>(({ children, className, ...props }) => {
  return (
    <small {...props} className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </small>
  );
});
