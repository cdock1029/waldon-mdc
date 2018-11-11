import React from 'react'
import styled from '@emotion/styled'

export function Spinner() {
  return (
    <SpinnerWrapper>
      <div className="double-bounce1" />
      <div className="double-bounce2" />
    </SpinnerWrapper>
  )
}
export default Spinner

const SpinnerWrapper = styled.div`
  width: 40px;
  height: 40px;

  position: relative;
  margin: 80px auto;

  .double-bounce1,
  .double-bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #333;
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;

    -webkit-animation: sk-bounce 2s infinite ease-in-out;
    animation: sk-bounce 2s infinite ease-in-out;
  }

  .double-bounce2 {
    -webkit-animation-delay: -1s;
    animation-delay: -1s;
  }

  @-webkit-keyframes sk-bounce {
    0%,
    100% {
      -webkit-transform: scale(0);
    }
    50% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bounce {
    0%,
    100% {
      transform: scale(0);
      -webkit-transform: scale(0);
    }
    50% {
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }
`
