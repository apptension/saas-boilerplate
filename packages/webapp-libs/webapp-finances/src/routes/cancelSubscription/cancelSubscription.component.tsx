import { Button } from '@sb/webapp-core/components/buttons';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph, ParagraphBold } from '@sb/webapp-core/components/typography';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { useActiveSubscriptionDetailsData } from '../../hooks';
import { useCancelSubscription } from './cancelSubscription.hook';

export const CancelSubscription = () => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { activeSubscriptionRenewalDate, activeSubscriptionPlan } =
    useActiveSubscriptionDetailsData(activeSubscription);

  const { handleCancel } = useCancelSubscription();

  if (!activeSubscription) return null;

  return (
    <PageLayout className="flex space-y-4 flex-col">
      <PageHeadline
        header={<FormattedMessage defaultMessage="Current plan info" id="Cancel subscription / Current plan header" />}
        hasBackButton
        subheader={
          <FormattedMessage
            defaultMessage="Details about your current plan"
            id="Cancel subscription / Current plan label"
          />
        }
      />

      <Paragraph className="flex flex-row">
        <FormattedMessage defaultMessage="Active plan: " id="Cancel subscription / Active plan" />
        <ParagraphBold className="ml-1">{activeSubscriptionPlan?.name}</ParagraphBold>
      </Paragraph>

      <Paragraph className="flex flex-row mt-0">
        <FormattedMessage defaultMessage="Active plan price:" id="Cancel subscription / Active plan price" />
        <ParagraphBold className="ml-1">{activeSubscriptionPlan?.price} USD</ParagraphBold>
      </Paragraph>

      {activeSubscriptionRenewalDate && (
        <Paragraph className="flex flex-row">
          <FormattedMessage defaultMessage="Next renewal / expiry: " id="Cancel subscription / Next renewal" />
          <ParagraphBold className="ml-1">
            <FormattedDate value={activeSubscriptionRenewalDate} />
          </ParagraphBold>
        </Paragraph>
      )}

      <Button className="w-fit" onClick={handleCancel}>
        <FormattedMessage defaultMessage="Cancel subscription" id="Cancel subscription / Button label" />
      </Button>
    </PageLayout>
  );
};
