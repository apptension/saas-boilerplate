import * as TabsPrimitive from '@radix-ui/react-tabs/dist';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

describe('UI/Tabs: component', () => {
  const firstTabContent = 'First tab content.';
  const secondTabContent = 'Second tab content.';

  const Component = (props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) => (
    <Tabs defaultValue="first" {...props}>
      <TabsList>
        <TabsTrigger value="first">First tab</TabsTrigger>
        <TabsTrigger value="second">Second tab</TabsTrigger>
      </TabsList>
      <TabsContent value="first">{firstTabContent}</TabsContent>
      <TabsContent value="second">{secondTabContent}</TabsContent>
    </Tabs>
  );

  it('Should show first tab by default', async () => {
    render(<Component />);

    expect(await screen.findByText(firstTabContent)).toBeVisible();
    expect(screen.queryByText(secondTabContent)).not.toBeInTheDocument();
  });

  it('Should second tab when defaultValue set', async () => {
    render(<Component defaultValue="second" />);

    expect(screen.queryByText(firstTabContent)).not.toBeInTheDocument();
    expect(await screen.findByText(secondTabContent)).toBeVisible();
  });

  it('Should second tab after click', async () => {
    render(<Component />);

    await userEvent.click(await screen.findByText('Second tab'));

    expect(screen.queryByText(firstTabContent)).not.toBeInTheDocument();
    expect(await screen.findByText(secondTabContent)).toBeVisible();
  });
});
