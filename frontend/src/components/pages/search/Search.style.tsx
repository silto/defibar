import styled from 'styled-components';

export const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
  font-family: var(--Roboto-Slab);
  border: 1px solid;
  border-image-source: url(/border-image.png);
  border-image-slice: 60;
  border-image-width: 30;
  border-image-outset: 0;
  border-image-repeat: repeat;
  outline: none;
`;

export const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 80vh;
  padding: 0 20px 20px;
  top: 20%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
`;

export const Title = styled.div`
  max-width: 600px;
  max-height: 154px;
  height: 20vh;
  width: 100%;
  margin: 0;
  padding: 0 40px 20px;
  display: flex;
  > svg {
    width: 100%;
    height: auto;
  }
`;

export const InputContainer = styled.form`
  width: 100%;
  max-width: 500px;
  height: 50px;
  padding: 0 40px;
  flex-grow: 0;
  flex-shrink: 0;
`;

export const ResultsContainer = styled.div`
  margin-top: 30px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 10px 20px;
  overflow: scroll;
  border-radius: 0 0 20px 20px;
`;

export const ProtocolBlock = styled.a<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  text-decoration: none;
  outline: none;
  border: ${({ theme }) => `1px solid ${theme.gold}`};
  /* color: ${({ theme }) => theme.textDefault}; */
  border-radius: 4px;
  background: ${({ theme, selected }) => (selected ? `${theme.gold}30` : theme.background)};
  &:hover {
    background: ${({ theme }) => `${theme.gold}30`};
  }
`;

export const ProtocolLogo = styled.div<{ imgUrl: string }>`
  background-image: url(${({ imgUrl }) => imgUrl});
  flex-grow: 0;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  background-size: cover;
`;

export const ProtocolName = styled.div`
  color: ${({ theme }) => theme.textDefault};
  font-size: 16px;
  font-weight: 400;
`;

export const InfoContainer = styled.div`
  display: block;
  position: absolute;
  bottom: 6px;
  right: 5px;
`;
