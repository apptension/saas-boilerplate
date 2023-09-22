import { fireEvent, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { render } from '../../../../tests/utils/rendering';
import { Link, LinkProps } from '../link.component';

describe('Link: Component', () => {
  const defaultProps: LinkProps = {
    href: 'https://apptension.com',
  };
  const placeholder = 'Content mock';

  const Component = (props: Partial<LinkProps>) => (
    <Routes>
      <Route index element={<Link {...defaultProps} {...props} />} />
      <Route path="example-path" element={placeholder} />
    </Routes>
  );

  it('should call onClick prop when clicked', async () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();

    render(
      <Component href="#" onClick={onClick}>
        {label}
      </Component>
    );

    fireEvent.click(await screen.findByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the element', async () => {
    render(<Component aria-label="some-label" />);
    expect(await screen.findByRole('link')).toHaveAttribute('aria-label', 'some-label');
  });

  describe('with external link', () => {
    it('should display link with correct URL', async () => {
      render(<Component />);
      expect(await screen.findByRole('link')).toHaveAttribute('href', 'https://apptension.com');
    });
  });

  describe('with internal link', () => {
    it('should display link with correct URL', async () => {
      render(<Component href={undefined} to="example-path" />);
      expect(await screen.findByRole('link')).toHaveAttribute('href', '/example-path');
    });

    it('should use react-router navigation when clicked', async () => {
      render(<Component href={undefined} to="example-path" />);
      await userEvent.click(await screen.findByRole('link'));
      expect(screen.getByText(placeholder)).toBeInTheDocument();
    });
  });
});
