import { makeContextRenderer } from '../../../utils/testUtils';
import { Dropzone, DropzoneProps } from '../dropzone.component';

describe('Dropzone: Component', () => {
  const defaultProps: DropzoneProps = {};

  const component = (props: Partial<DropzoneProps>) => <Dropzone {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
