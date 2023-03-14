import closeIcon from '@iconify-icons/ion/close-outline';
import { ReactNode, useCallback, useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';

import { Icon } from '../icons';
import { Portal } from '../portal';
import { Container, Content, Header, IconContainer, Overlay } from './modal.styles';

export type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  onClickAway?: () => void;
  onEscapeKey?: () => void;
  header?: ReactNode;
  children: ReactNode;
};

export const Modal = ({ isOpen, header, onClose, onClickAway, onEscapeKey, children }: ModalProps) => {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleClickAway = onClickAway ?? handleClose;
  const handleEscapeKey = onEscapeKey ?? handleClose;

  useEffect(() => {
    const closeOnEscapeKey = ({ key }: KeyboardEvent) => (key === 'Escape' ? handleEscapeKey() : null);

    document.body.addEventListener('keydown', closeOnEscapeKey);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey);
    };
  }, [handleEscapeKey]);

  return (
    <Portal wrapperId="modal-container">
      {isOpen && (
        <Overlay data-testid="modal-overlay">
          <ClickAwayListener onClickAway={handleClickAway}>
            <Container>
              <Header>
                {header ?? (
                  <IconContainer onClick={handleClose} data-testid="modal-icon-container">
                    <Icon size={32} icon={closeIcon} />
                  </IconContainer>
                )}
              </Header>
              <Content>{children}</Content>
            </Container>
          </ClickAwayListener>
        </Overlay>
      )}
    </Portal>
  );
};
