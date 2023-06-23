import { ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ReactPortalProps = {
  children: ReactNode;
  wrapperId?: string;
};

export const Portal = ({ children, wrapperId = 'react-portal-wrapper' }: ReactPortalProps) => {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const element = document.getElementById(wrapperId);
    const systemCreated = !element;

    if (systemCreated) {
      const createdElement = document.createElement('div');

      createdElement.setAttribute('id', wrapperId);
      document.body.appendChild(createdElement);

      setWrapperElement(createdElement);

      return () => {
        if (createdElement.parentNode) {
          createdElement.parentNode.removeChild(createdElement);
        }
      };
    }

    setWrapperElement(element);

    return () => undefined;
  }, [wrapperId]);

  return wrapperElement ? createPortal(children, wrapperElement) : null;
};
