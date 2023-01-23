import { Story } from '@storybook/react';
import { withRouter } from '../../../../.storybook/decorators';
import { BackButton, BackButtonProps } from './backButton.component';

const Template: Story<BackButtonProps> = (args: BackButtonProps) => <BackButton {...args} />;

export default {
  title: 'Shared/BackButton',
  component: BackButton,
  decorators: [withRouter()],
};

export const Primary = Template.bind({});
Primary.args = { to: '#' };
