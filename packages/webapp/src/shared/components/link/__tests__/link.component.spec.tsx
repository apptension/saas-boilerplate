import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { render } from '../../../../tests/utils/rendering';
import { Link, LinkProps } from '../link.component';

describe('Link: Component', () => {
  const defaultProps: LinkProps = {
    href: 'http://apptension.com',
  };
  const placeholder = 'Content mock';

  const Component = (props: Partial<LinkProps>) => (
    <Routes>
      <Route index element={<Link {...defaultProps} {...props} />} />
      <Route path="example-path" element={placeholder} />
    </Routes>
  );

  it('should call onClick prop when clicked', () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();
    render(<Component onClick={onClick}>{label}</Component>);

    fireEvent.click(screen.getByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the element', () => {
    render(<Component aria-label="some-label" />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'some-label');
  });

  describe('with external link', () => {
    it('should display link with correct URL', () => {
      render(<Component />);
      expect(screen.getByRole('link')).toHaveAttribute('href', 'http://apptension.com');
    });
  });

  describe('with internal link', () => {
    it('should display link with correct URL', () => {
      render(<Component href={undefined} to="example-path" />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/example-path');
    });

    it('should use react-router navigation when clicked', async () => {
      render(<Component href={undefined} to="example-path" />);
      await userEvent.click(screen.getByRole('link'));
      expect(screen.getByText(placeholder)).toBeInTheDocument();
    });
  });
});
