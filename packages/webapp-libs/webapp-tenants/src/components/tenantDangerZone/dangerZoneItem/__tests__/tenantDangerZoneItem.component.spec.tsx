import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { DangerZoneItem, DangerZoneItemProps } from '../dangerZoneItem.component';

const subtitle = 'subtitle';

const defaultProps: DangerZoneItemProps = {
  title: 'title',
  onClick: jest.fn(),
  buttonText: 'buttonText',
  subtitle,
};

describe('DangerZoneItem: Component', () => {
  const Component = (args: Partial<Omit<DangerZoneItemProps, 'children'>>) => (
    <DangerZoneItem {...defaultProps} {...args} />
  );

  it('should render all items', async () => {
    render(<Component />);

    expect(await screen.findByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.buttonText)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('should not render subtitle', async () => {
    render(<Component subtitle={undefined} />);

    expect(screen.queryByText(subtitle)).not.toBeInTheDocument();
  });

  it('should render custom Button', async () => {
    const text = 'text';
    render(
      <DangerZoneItem title={defaultProps.title}>
        <div>{text}</div>
      </DangerZoneItem>
    );

    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.buttonText)).not.toBeInTheDocument();
  });

  it('should call onClick', async () => {
    const onClickMock = jest.fn();
    render(<Component onClick={onClickMock} />);

    const button = await screen.findByRole('button', { name: defaultProps.buttonText });
    await userEvent.click(button);
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should not call onClick', async () => {
    const onClickMock = jest.fn();
    render(<Component onClick={onClickMock} disabled={true} />);

    const button = await screen.findByRole('button', { name: defaultProps.buttonText });
    await userEvent.click(button);
    expect(onClickMock).not.toHaveBeenCalled();
  });
});
