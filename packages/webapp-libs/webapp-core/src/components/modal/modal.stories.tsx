import { Story } from '@storybook/react';

import { Modal, ModalProps } from './modal.component';

const Template: Story<ModalProps> = (args: ModalProps) => {
  return <Modal {...args} />;
};

export default {
  title: 'Shared/Modal',
  component: Modal,
};

export const Open = Template.bind({
  isOpen: true,
  children: <>Modal content</>,
});
Open.args = {
  isOpen: true,
  children: <>Modal content</>,
};

export const CustomHeader = Template.bind({
  isOpen: true,
  header: <>Custom header</>,
  children: <>Modal content</>,
});
CustomHeader.args = {
  isOpen: true,
  header: <>Custom header</>,
  children: <>Modal content</>,
};
