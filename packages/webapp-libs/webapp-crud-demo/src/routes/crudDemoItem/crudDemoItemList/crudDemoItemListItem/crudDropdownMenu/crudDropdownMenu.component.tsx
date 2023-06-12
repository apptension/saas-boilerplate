import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { Button, Link as ButtonLink, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/popover';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../../config/routes';
import { Menu, ToggleButton, ToggleButtonCircle } from './crudDropdownMenu.styles';

export type CrudDropdownMenuProps = {
  itemId: string;
  handleDelete: (e: MouseEvent<HTMLButtonElement>) => void;
  loading: boolean;
  className?: string;
};

export const CrudDropdownMenu = ({ itemId, className, handleDelete, loading }: CrudDropdownMenuProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Popover>
      <PopoverTrigger>
        <ToggleButton
          aria-label={intl.formatMessage({
            defaultMessage: 'Open item actions',
            id: 'CrudDemoItemList.Open item actions',
          })}
        >
          <ToggleButtonCircle />
          <ToggleButtonCircle />
          <ToggleButtonCircle />
        </ToggleButton>
      </PopoverTrigger>
      <PopoverContent className={className}>
        <Menu>
          <ButtonLink
            variant={ButtonVariant.SECONDARY}
            to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: itemId })}
            icon={<Icon size={14} icon={editIcon} />}
          >
            <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
          </ButtonLink>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            icon={<Icon size={14} icon={deleteIcon} />}
          >
            <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
          </Button>
        </Menu>
      </PopoverContent>
    </Popover>
  );
};
