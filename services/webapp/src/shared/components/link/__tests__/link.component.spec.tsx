import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../utils/testUtils';
import { Link, LinkProps } from '../link.component';

describe('Link: Component', () => {
  const defaultProps: LinkProps = {
    href: 'http://apptension.com',
  };

  const component = (props: Partial<LinkProps>) => <Link {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should call onClick prop when clicked', () => {
    const label = <span>PRESS HERE</span>;
    const onClick = jest.fn();
    render({ onClick, children: label });

    fireEvent.click(screen.getByText('PRESS HERE'));
    expect(onClick).toHaveBeenCalled();
    onClick.mockReset();

    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should pass native HTML props directly to the element', () => {
    render({ 'aria-label': 'some-label' });
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'some-label');
  });

  describe('with external link', () => {
    it('should display link with correct URL', () => {
      render();
      expect(screen.getByRole('link')).toHaveAttribute('href', 'http://apptension.com');
    });

    it('shouldnt use react-router navigation when clicked', () => {
      const { history, pushSpy } = spiedHistory();
      render({}, { router: { history } });
      userEvent.click(screen.getByRole('link'));
      expect(pushSpy).not.toHaveBeenCalled();
    });
  });

  describe('with internal link', () => {
    it('should display link with correct URL', () => {
      render({ href: undefined, to: '/home' });
      expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
    });

    it('should use react-router navigation when clicked', () => {
      const { history, pushSpy } = spiedHistory();
      render({ href: undefined, to: '/home' }, { router: { history } });
      userEvent.click(screen.getByRole('link'));
      expect(pushSpy).toHaveBeenCalledWith('/home');
    });
  });
});
