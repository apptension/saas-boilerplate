import { Story } from '@storybook/react';
import { withRouter } from '../../../../.storybook/decorators';
import { withRedux } from '../../utils/storybook';
import { LanguageSwitcher } from '.';

const Template: Story = () => <LanguageSwitcher />;

export default {
  title: 'Shared/LanguageSwitcher',
  decorators: [withRedux(), withRouter()],
};

export const Default = Template.bind({});
Default.args = {};
