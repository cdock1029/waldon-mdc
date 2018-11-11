import React from 'react'
import styled from '@emotion/styled'
import { Elevation } from 'rmwc'

const StyledNoData = styled(Elevation)({
  label: 'NoData',
  padding: '1rem 2rem',
  // border: '1px solid var(--mdc-theme-secondary)',
  color: 'var(--mdc-theme-primary)',
  fontWeight: '500',
  borderRadius: '4px',
  backgroundColor: '#fff',
  margin: '1rem',
})

export const NoData = ({ label, z = 2 }) => (
  <StyledNoData z={z}>
    <p>No {label} exist</p>
  </StyledNoData>
)
