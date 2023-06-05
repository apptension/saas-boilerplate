import { Input } from '@sb/webapp-core/components/forms';
import { color } from '@sb/webapp-core/theme';
import { horizontalPadding, sizeUnits, verticalMargin } from '@sb/webapp-core/theme/size';
import { H5, MicroLabel, Paragraph } from '@sb/webapp-core/theme/typography';
import styled from 'styled-components';

export const Container = styled.div`
  background-color: ${color.white};
  width: auto;
  max-width: 100%;
  text-align: left;
  padding: ${sizeUnits(1)};
`;

export const Body = styled.div`
  ${horizontalPadding(sizeUnits(2))};
  padding-bottom: ${sizeUnits(2.5)};
`;

export const SectionHeader = styled(H5)`
  color: ${color.skyBlueScale.base};
  ${verticalMargin(sizeUnits(1.2))};
  border-bottom: 1px solid;
  border-bottom-color: ${color.greyScale.get(95)};
`;

export const MainHeader = styled(SectionHeader)`
  margin-top: 0;
`;

export const BodyParagraph = styled(Paragraph)`
  font-size: ${sizeUnits(1.75)};
  word-break: break-word;
`;

export const ConfigList = styled.ol`
  padding-left: 0;
  list-style: decimal inside none;
`;

export const ConfigListItem = styled.li`
  font-size: ${sizeUnits(1.75)};
`;

export const InlineButtons = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${sizeUnits(2)};
`;

export const QRCodeContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const QRCodeImg = styled.img`
  width: 264px;
  height: 264px;
`;

export const ErrorMessage = styled(MicroLabel)`
  position: absolute;
  top: ${sizeUnits(6)};
  font-size: 14px;
  color: ${color.error};
  max-width: 100%;
`;

export const CodeForm = styled.form`
  position: relative;
`;
export const CodeInput = styled(Input)`
  margin-top: ${sizeUnits(2)};
  margin-bottom: ${sizeUnits(4)};
  input {
    min-width: 150px;
    max-width: 150px;
  }
`;
