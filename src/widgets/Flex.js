import styled from 'react-emotion/macro'

export const Flex = styled.div`
  display: flex;
  ${({ children, ...rest }) => ({ ...rest })};
`
