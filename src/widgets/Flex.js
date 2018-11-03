import styled from 'styled-components/macro'

export const Flex = styled.div`
  display: flex;
  ${({ children, ...rest }) => ({ ...rest })};
`
