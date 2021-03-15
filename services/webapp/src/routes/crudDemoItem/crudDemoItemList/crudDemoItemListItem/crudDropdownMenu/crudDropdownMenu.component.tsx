import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import ClickAwayListener from 'react-click-away-listener';
import { generatePath } from 'react-router-dom';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { useDispatch } from 'react-redux';
import { Link as ButtonLink } from '../../../../../shared/components/link';
import { ButtonVariant } from '../../../../../shared/components/button/button.types';
import { Button } from '../../../../../shared/components/button';
import { Icon } from '../../../../../shared/components/icon';
import { useLocaleUrl } from '../../../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../../app.constants';
import { crudDemoItemActions } from '../../../../../modules/crudDemoItem';
import { Container, Menu, ToggleButton, ToggleButtonCircle } from './crudDropdownMenu.styles';

export interface CrudDropdownMenuProps {
  itemId: string;
  className?: string;
}

export const CrudDropdownMenu = ({ itemId, className }: CrudDropdownMenuProps) => {
  const [isOpen, setOpen] = useState(false);
  const intl = useIntl();
  const editUrl = useLocaleUrl(ROUTES.crudDemoItem.edit);
  const dispatch = useDispatch();

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(crudDemoItemActions.deleteCrudDemoItem(itemId));
  };

  return (
    <Container className={className}>
      <ToggleButton
        onClick={(e) => {
          e.preventDefault();
          setOpen((isOpen) => !isOpen);
        }}
        aria-label={intl.formatMessage({
          defaultMessage: 'Open item actions',
          description: 'CrudDemoItemList / Open item actions',
        })}
        aria-expanded={isOpen}
      >
        <ToggleButtonCircle />
        <ToggleButtonCircle />
        <ToggleButtonCircle />
      </ToggleButton>

      <ClickAwayListener
        onClickAway={(e) => {
          if (isOpen) {
            setOpen(false);
            e.preventDefault();
          }
        }}
      >
        <Menu isOpen={isOpen}>
          <ButtonLink
            variant={ButtonVariant.FLAT}
            to={generatePath(editUrl, { id: itemId })}
            icon={<Icon size={14} icon={editIcon} />}
          >
            <FormattedMessage description={'CrudDemoItem list / Edit link'} defaultMessage={'Edit'} />
          </ButtonLink>
          <Button variant={ButtonVariant.FLAT} onClick={handleDelete} icon={<Icon size={14} icon={deleteIcon} />}>
            <FormattedMessage description={'CrudDemoItem list / Delete button'} defaultMessage={'Delete'} />
          </Button>
        </Menu>
      </ClickAwayListener>
    </Container>
  );
};
