import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { contentWithLimitedWidth, contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { heading1, heading2, heading4, heading3, paragraph } from '../../../theme/typography';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(2))};
  ${contentWithLimitedWidth};
  margin-left: 0;
`;

export const Markdown = styled(ReactMarkdown)`
  margin-top: ${sizeUnits(2)};

  h1 {
    ${heading1};
  }

  h2 {
    ${heading2};
  }

  h3 {
    ${heading3};
  }

  h4,
  h5 {
    ${heading4};
  }

  h1,
  h2 {
    margin-bottom: ${sizeUnits(4)};
  }

  h3,
  h4 {
    margin-bottom: ${sizeUnits(2)};
  }

  p {
    ${paragraph};
  }

  p + p {
    margin-top: ${sizeUnits(2)};
  }
`;
