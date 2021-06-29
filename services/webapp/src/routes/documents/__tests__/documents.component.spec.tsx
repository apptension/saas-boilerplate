import { Documents } from '../documents.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';

describe('Documents: Component', () => {
  const component = () => <Documents />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
