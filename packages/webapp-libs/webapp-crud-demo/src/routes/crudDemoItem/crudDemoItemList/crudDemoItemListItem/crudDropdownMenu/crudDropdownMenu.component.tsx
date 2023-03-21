import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { Button, Link as ButtonLink, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { MouseEvent, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../../config/routes';
import { Container, Menu, ToggleButton, ToggleButtonCircle } from './crudDropdownMenu.styles';

export type CrudDropdownMenuProps = {
  itemId: string;
  handleDelete: (e: MouseEvent<HTMLButtonElement>) => void;
  loading: boolean;
  className?: string;
};

export const CrudDropdownMenu = ({ itemId, className, handleDelete, loading }: CrudDropdownMenuProps) => {
  const [isOpen, setOpen] = useState(false);
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();

  return (
    <ClickAwayListener
      onClickAway={(e) => {
        if (isOpen) {
          setOpen(false);
          e.preventDefault();
        }
      }}
    >
      <Container className={className}>
        <ToggleButton
          onClick={(e) => {
            e.preventDefault();
            setOpen((isOpen) => !isOpen);
          }}
          aria-label={intl.formatMessage({
            defaultMessage: 'Open item actions',
            id: 'CrudDemoItemList.Open item actions',
          })}
          aria-expanded={isOpen}
        >
          <ToggleButtonCircle />
          <ToggleButtonCircle />
          <ToggleButtonCircle />
        </ToggleButton>

        <Menu isOpen={isOpen}>
          <ButtonLink
            variant={ButtonVariant.FLAT}
            to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: itemId })}
            icon={<Icon size={14} icon={editIcon} />}
          >
            <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
          </ButtonLink>
          <Button
            variant={ButtonVariant.FLAT}
            onClick={handleDelete}
            disabled={loading}
            icon={<Icon size={14} icon={deleteIcon} />}
          >
            <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
          </Button>
        </Menu>
      </Container>
    </ClickAwayListener>
  );
};
