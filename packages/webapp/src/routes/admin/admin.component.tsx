import { H2, H4, Small } from '@sb/webapp-core/components/typography';
import { Card } from '@sb/webapp-core/components/ui/card';
import { ShieldCheckIcon } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export const Admin = () => {
  return (
    <div className="px-4">
      <div className="w-full text-center">
        <H2>
          <FormattedMessage defaultMessage="This page is only visible for admins" id="Admin / Heading" />
        </H2>
      </div>
      <div className="mt-5 flex flex-row flex-wrap justify-around">
        <Card className="flex w-full max-w-sm flex-col justify-center rounded-2xl px-8 py-4">
          <div className="flex w-full justify-center p-2">
            <ShieldCheckIcon size={48} />
          </div>
          <H4>
            <FormattedMessage defaultMessage="It's fully secure" id="Admin / Card / Title" />
          </H4>
          <Small className="py-2">
            <FormattedMessage defaultMessage="Regular users do not have access here" id="Admin / Card / Subtitle" />
          </Small>
        </Card>
      </div>
    </div>
  );
};
