import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

import { size, typography } from '../../theme';

export const Container = styled.div`
  ${size.contentWrapper};
  ${size.verticalPadding(size.sizeUnits(2))};
  ${size.contentWithLimitedWidth};
  margin-left: 0;
`;

export const Markdown = styled(ReactMarkdown)`
  margin-top: ${size.sizeUnits(2)};

  h1 {
    ${typography.heading1};
  }

  h2 {
    ${typography.heading2};
  }

  h3 {
    ${typography.heading3};
  }

  h4,
  h5 {
    ${typography.heading4};
  }

  h1,
  h2 {
    margin-bottom: ${size.sizeUnits(4)};
  }

  h3,
  h4 {
    margin-bottom: ${size.sizeUnits(2)};
  }

  p {
    ${typography.paragraph};
  }

  p + p {
    margin-top: ${size.sizeUnits(2)};
  }
`;
