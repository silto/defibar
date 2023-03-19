import React, { useState } from 'react';
import styled from 'styled-components';
import { RobotoSlab } from '@/lib/fonts';

const StyledInfoWrapper = styled.div`
  position: relative;
`;

const StyledInfo = styled.div`
  width: 16px;
  height: 16px;
  border: 1px solid;
  border-radius: 8px;
  border-color: ${({ theme }) => theme.gold};
  color: ${({ theme }) => theme.gold};
  font-weight: 500;
  font-size: 13px;
  line-height: 14px;
  cursor: pointer;
  text-align: center;
  font-family: var(--Roboto-Slab);
`;

const InfoPopupBackground = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 3999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const InfoPopup = styled.div`
  position: absolute;
  z-index: 4000;
  width: 450px;
  height: 288px;
  max-width: calc(100vw - 50px);
  max-height: calc(100vh - 50px);
  margin: 20px;
  background: ${({ theme }) => theme.background};
  border: 1px solid;
  border-color: ${({ theme }) => theme.gold};
  border-radius: 7px;
  font-family: var(--Roboto-Slab);
  > .text {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 12px;
    right: 12px;
    overflow: scroll;
  }
  h3 {
    color: ${({ theme }) => theme.textDefault};
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    margin: 0 0 10px;
  }
  p {
    color: ${({ theme }) => theme.textDefault};
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    margin: 0 0 10px;
    &.noMargin {
      margin: 0;
    }
    &.paragraphEnd {
      margin: 0 0 20px;
    }
  }
  a {
    color: ${({ theme }) => theme.gold};
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  bottom: 0;
  right: 0;
`;

const Info = () => {
  const [popupOpened, setPopupOpened] = useState<boolean>(false);

  return (
    <StyledInfoWrapper>
      <StyledInfo className={RobotoSlab.variable} onClick={() => setPopupOpened(!popupOpened)}>
        {'i'}
      </StyledInfo>
      {popupOpened && (
        <>
          <InfoPopupBackground onClick={() => setPopupOpened(false)} />
          <InfoPopup className={RobotoSlab.variable}>
            <div className="text">
              <h3>{'Usage :'}</h3>
              <p>{'Hitting "Enter" automatically takes you to the first result for your query.'}</p>
              <p className="paragraphEnd">
                {
                  'Hitting ↑ or ↓ allows you to quickly navigate between results. Hit "Enter" to go to the selected app.'
                }
              </p>
              <h3>{'Credits :'}</h3>
              {/* <p>
                {'The list of apps and their URLs is fetched regularly from '}
                <a href="https://defillama.com/" rel="noreferrer" target="_blank">
                  {'DefiLlama'}
                </a>
                {"'s API. You can donate to them at "}
                <a
                  href="https://etherscan.io/address/0x08a3c2a819e3de7aca384c798269b3ce1cd0e437"
                  rel="noreferrer"
                  target="_blank"
                >
                  {'this address'}
                </a>
                {'.'}
              </p> */}
              {/* Temporary (I hope) notice about protocol updates suspension */}
              <p>
                {
                  "The list of apps and their URLs was fetched from DefiLlama's API (last updated March 19th 2023 at 5AM UTC)."
                }
              </p>
              <p>
                {
                  "The protocol list updates are currently disabled due to the uncertainty concerning DefiLlama's internal power struggles."
                }
              </p>
              <p className="noMargin">
                {'© 2023 DEFIBAR by '}
                <a href="https://twitter.com/_silto_" rel="noreferrer" target="_blank">
                  {'Silto'}
                </a>
              </p>
            </div>
          </InfoPopup>
        </>
      )}
    </StyledInfoWrapper>
  );
};

export default Info;
