import React from 'react'
import styled, { css } from 'react-emotion/macro'
import { Typography, Button, ButtonIcon } from 'rmwc'
import { DataTable } from '../DataTable'

export class Dashboard extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div className={styles}>
        <div className="Dashboard-Header">{children}</div>
        <div className="Dashboard-Data">
          <LeaseTableHeader>
            <Typography use="headline5">Leases</Typography>
            <Button>
              <ButtonIcon icon="add" />
              New lease
            </Button>
          </LeaseTableHeader>
          <div className="DataTable-wrapper">
            <DataTable />
          </div>
        </div>
      </div>
    )
  }
}

const styles = css`
  label: Dashboard;
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  .rch-rtr-rt {
    height: auto;
  }
  .Dashboard-Header {
    min-height: 10rem;
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
