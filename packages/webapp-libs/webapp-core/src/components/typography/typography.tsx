import { HtmlHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type HeadingProps = HtmlHTMLAttributes<HTMLHeadingElement>;

export const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(({ children, className, ...props }, ref) => {
  return (
    <h1
      {...props}
      ref={ref}
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}
    >
      {children}
    </h1>
  );
});

export const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(({ children, className, ...props }, ref) => {
  return (
    <h2 {...props} ref={ref} className={cn('tracking-tight" scroll-m-20 text-3xl font-semibold', className)}>
      {children}
    </h2>
  );
});

export const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(({ children, className, ...props }, ref) => {
  return (
    <h3 {...props} ref={ref} className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
});

export const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(({ children, className, ...props }, ref) => {
  return (
    <h4 {...props} ref={ref} className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}>
      {children}
    </h4>
  );
});

export type ParagraphProps = HtmlHTMLAttributes<HTMLParagraphElement> & {
  firstChildMargin?: boolean;
};

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ children, className, firstChildMargin = true, ...props }, ref) => {
    return (
      <p
        {...props}
        ref={ref}
        className={cn({ '[&:not(:first-child)]:mt-6': firstChildMargin }, 'leading-7', className)}
      >
        {children}
      </p>
    );
  }
);

export const ParagraphBold = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ children, className, firstChildMargin, ...props }, ref) => {
    return (
      <p
        ref={ref}
        {...props}
        className={cn({ '[&:not(:first-child)]:mt-6': firstChildMargin }, 'font-semibold leading-7', className)}
      >
        {children}
      </p>
    );
  }
);

export type SmallProps = HtmlHTMLAttributes<HTMLElement>;

export const Small = forwardRef<HTMLElement, SmallProps>(({ children, className, ...props }, ref) => {
  return (
    <small {...props} ref={ref} className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </small>
  );
});
