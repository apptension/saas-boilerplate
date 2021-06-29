import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { Document, DocumentProps } from '../document.component';

describe('Document: Component', () => {
  const defaultProps: DocumentProps = {};

  const component = (props: Partial<DocumentProps>) => <Document {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  })
});
