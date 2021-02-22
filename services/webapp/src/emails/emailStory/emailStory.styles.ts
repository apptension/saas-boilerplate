import styled from 'styled-components';

export const Container = styled.div``;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Subject = styled.div`
  &:before {
    content: 'Subject: ';
  }
  padding: 10px 0;
  border-bottom: 1px solid black;
`;

export const SendEmail = styled.div`
  text-align: right;
`;

export const SendEmailButton = styled.button``;

export const RecipientInput = styled.input``;

export const Email = styled.div``;
