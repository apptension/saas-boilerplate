import React, { HTMLAttributes } from 'react';

import { FormattedMessage } from 'react-intl';
import { ROUTES } from '../../../routes/app.constants';
import { RoleAccess } from '../roleAccess';
import { Role } from '../../../modules/auth/auth.types';
import { useLocale } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { Container, MenuLink } from './sidebar.styles';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const locale = useLocale();

  return (
    <Container {...props}>
      <MenuLink to={`/${locale}${ROUTES.demoItems}`}>
        <FormattedMessage defaultMessage="Demo Contentful items" description="Home / demo contentful items link" />
      </MenuLink>

      <MenuLink to={`/${locale}${ROUTES.crudDemoItem.list}`}>
        <FormattedMessage defaultMessage="CRUD Example Items" description="Home / CRUD example items link" />
      </MenuLink>

      <RoleAccess allowedRoles={Role.ADMIN}>
        <MenuLink to={`/${locale}${ROUTES.admin}`}>
          <FormattedMessage defaultMessage="Admin" description="Home / admin link" />
        </MenuLink>
      </RoleAccess>

      <MenuLink to={`/${locale}${ROUTES.privacyPolicy}`}>
        <FormattedMessage defaultMessage="Privacy policy" description="Home / privacy policy link" />
      </MenuLink>

      <MenuLink to={`/${locale}${ROUTES.termsAndConditions}`}>
        <FormattedMessage defaultMessage="Terms and conditions" description="Home / t&c link" />
      </MenuLink>
    </Container>
  );
};
