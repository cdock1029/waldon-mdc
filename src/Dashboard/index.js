import React from 'react'
import styled from '@emotion/styled'
import { Typography } from 'rmwc'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import { DataTable } from '../DataTable'

export function Dashboard({ children }) {
  return (
    <DashboardWrapper>
      <div className="Dashboard-Header">{children}</div>
      <div className="Dashboard-Data">
        <LeaseTableHeader>
          <Typography use="headline5">Leases</Typography>
          <Button type="button" icon={<MaterialIcon icon="add" />}>
            New lease
          </Button>
        </LeaseTableHeader>
        <div className="DataTable-wrapper">
          <DataTable />
        </div>
      </div>
    </DashboardWrapper>
  )
}

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  .rch-rtr-rt {
    height: auto;
  }
  .Dashboard-Header {
    min-height: 11.5rem;
  }
  .Dashboard-Data {
    flex: 1;
    display: flex;
    flex-direction: column;

    padding: 2em 0;

    .DataTable-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2em 0;
    }
  }
`

const LeaseTableHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
