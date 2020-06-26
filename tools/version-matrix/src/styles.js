import styled from 'styled-components';

export const CardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    @media screen and (max-width: 600px) {
        justify-content: center;
    }
`;

export const Card = styled.div`
    padding: 10px;
    margin: 2px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: all .3s ease-in-out;
    box-sizing: border-box;
    width: 290px;

    &:hover {
        box-shadow: rgba(0, 0, 0, 0.22) 0px 19px 43px;
        transform: translate3d(0px, -1px, 0px);
    }
`;

export const CardHeader = styled.h2`
    text-align: center;
    margin: 10px 0 10px;
`;

export const CardPair = styled.div`
    margin: 0 0 0.5rem;
`;

export const CardKey = styled.span`
    font-weight: bolder;
`;

export const CardStripe = styled.div`
    background: #1165f1;
    font-size: 1.5rem;
    color: #fff;
    padding: 5px 0 5px;
    margin: 0 0 10px;
    text-align: center;
    border-radius: 5px;
`;
