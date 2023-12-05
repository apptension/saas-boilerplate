import { css, default as styled } from 'styled-components';

import { fontFamily, fontWeight } from './font';

export const heading1 = css`
  font-family: ${fontFamily.primary};
  font-weight: ${fontWeight.bold};
  font-size: 39px;
  line-height: 43px;
`;

export const heading2 = css`
  ${heading1};
  font-size: 31px;
  line-height: 43px;
`;

export const heading3 = css`
  ${heading1};
  font-size: 25px;
  line-height: 35px;
`;

export const heading4 = css`
  ${heading1};
  font-size: 20px;
  line-height: 28px;
`;

export const heading5 = css`
  ${heading1};
  font-size: 18px;
  line-height: 32px;
`;

export const paragraph = css`
  font-family: ${fontFamily.primary};
  font-size: 16px;
  line-height: 22px;
`;

export const paragraphBold = css`
  ${paragraph};
  font-weight: ${fontWeight.bold};
`;

export const label = css`
  font-family: ${fontFamily.primary};
  font-size: 13px;
  line-height: 18px;
  font-weight: ${fontWeight.regular};
`;

export const labelBold = css`
  ${label};
  font-weight: ${fontWeight.bold};
`;

export const microlabel = css`
  font-family: ${fontFamily.primary};
  font-size: 10px;
  line-height: 14px;
  font-weight: ${fontWeight.regular};
`;

export const ultraMicrolabel = css`
  font-family: ${fontFamily.primary};
  font-size: 8px;
  line-height: 10px;
  font-weight: ${fontWeight.regular};
`;

export const H1 = styled.h1`
  ${heading1}
`;
export const H2 = styled.h2`
  ${heading2}
`;
export const H3 = styled.h3`
  ${heading3}
`;
export const H4 = styled.h4`
  ${heading4}
`;
export const H5 = styled.h5`
  ${heading5}
`;
export const Paragraph = styled.p`
  ${paragraph}
`;
export const ParagraphBold = styled.p`
  ${paragraphBold}
`;
export const Label = styled.p`
  ${label}
`;
export const MicroLabel = styled.p`
  ${microlabel}
`;
export const UltraMicroLabel = styled.p`
  ${ultraMicrolabel}
`;
