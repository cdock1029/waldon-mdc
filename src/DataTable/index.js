import React, { Fragment, useContext, useState, useMemo, Suspense } from 'react'
import styled from '@emotion/styled'
// import { Typography } from 'rmwc'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'
import {
  DataTable as RmwcDataTable,
  DataTableContent,
  DataTableHead,
  DataTableBody,
  DataTableHeadCell,
  DataTableRow,
  DataTableCell,
} from '@rmwc/data-table'
import '@rmwc/data-table/data-table.css'
import { Cell, Column, Table } from '@blueprintjs/table'
import {
  Tag,
  Colors,
  H3,
  Alignment,
  Checkbox,
  RadioGroup,
  Radio,
  Label,
} from '@blueprintjs/core'
import { formatCents, formatDate } from '../utils/format'
import { NoData } from '../NoData'
import { Flex } from '../widgets/Flex'
import { LeasesResource, TransactionsResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'
import { QueryContext } from '../Location'
import { Spinner } from '../Spinner'

const NUM_COLUMNS = 7
const TABLE_MIN_WIDTH = '53rem'
const ACTIVE = 'ACTIVE'
const INACTIVE = 'INACTIVE'
function buildIt({ p: propertyId, u: unitId, t: tenantId, activeTabIndex }) {
  const activeValue = activeTabIndex ? INACTIVE : ACTIVE
  let where = [['status', '==', activeValue]]
  if (propertyId) {
    where.push([`properties.${propertyId}.exists`, '==', true])
    if (unitId) {
      where.push([`units.${unitId}.exists`, '==', true])
    }
  } else if (tenantId) {
    where.push([`tenants.${tenantId}.exists`, '==', true])
  }
  return where
}

export const DataTable = () => {
  // const [sortDir, setSortDir] = useState(null)
  const [activated, setActivated] = useState(null)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const { p, u, t } = useContext(QueryContext)
  const where = useMemo(
    () => {
      return buildIt({ p, u, t, activeTabIndex })
    },
    [p, u, t, activeTabIndex]
  )

  // function handleSortChange(sortDir) {
  //   setSortDir(sortDir)
  // }
  function handleRowClick(i) {
    setActivated(activated === i ? null : i)
  }
  function handleTabChange(index) {
    setActiveTabIndex(index)
  }
  return (
    <div className="wrapper-div">
      <StyledTabBar
        activeIndex={activeTabIndex}
        handleActiveIndexUpdate={handleTabChange}
      >
        <Tab>Active</Tab>
        <Tab>Inactive</Tab>
      </StyledTabBar>
      <StyledTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell
                alignStart
                /*sort={sortDir}
                onSortChange={handleSortChange}*/
              >
                Properties
              </DataTableHeadCell>
              <DataTableHeadCell>Units</DataTableHeadCell>
              <DataTableHeadCell>Tenants</DataTableHeadCell>
              <DataTableHeadCell>Start</DataTableHeadCell>
              <DataTableHeadCell>End</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Rent</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Balance</DataTableHeadCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            <Suspense
              fallback={
                <EmptyTableRowWrapper>
                  <Spinner />
                </EmptyTableRowWrapper>
              }
            >
              <LeaseLoadingContainer
                where={where}
                activated={activated}
                handleRowClick={handleRowClick}
              />
            </Suspense>
          </DataTableBody>
        </DataTableContent>
      </StyledTable>
    </div>
  )
}

function LeaseLoadingContainer({ where, activated, handleRowClick }) {
  const { activeCompany } = useContext(AuthContext).claims
  const leases = LeasesResource.read({ activeCompany, where })

  return (
    <>
      {leases.map((l, i) => (
        <LeaseRow
          key={l.id}
          lease={l}
          activated={i === activated}
          handleRowClick={() => handleRowClick(i)}
        />
      ))}
      <EmptyTableRowWrapper>
        {/* TODO: pagination row */ leases.length ? null : (
          <NoData label="Leases" z={0} />
        )}
      </EmptyTableRowWrapper>
    </>
  )
}

function EmptyTableRowWrapper({ children }) {
  return (
    <DataTableRow>
      <DataTableCell colSpan={NUM_COLUMNS}>
        <FullCellWrapper>{children}</FullCellWrapper>
      </DataTableCell>
    </DataTableRow>
  )
}

function LeaseRow({ activated, handleRowClick, lease }) {
  return (
    <Fragment>
      <DataTableRow
        className="leaseRow"
        activated={activated}
        onClick={handleRowClick}
      >
        <DataTableCell>
          {Object.values(lease.properties).map((p, i) => (
            <p key={i}>{p.name}</p>
          ))}
        </DataTableCell>
        <DataTableCell>
          {Object.values(lease.units).map((u, i) => (
            <p key={i}>{u.name}</p>
          ))}
        </DataTableCell>
        <DataTableCell>
          {Object.values(lease.tenants).map((t, i) => (
            <p key={i}>{t.name}</p>
          ))}
        </DataTableCell>
        <DataTableCell>{formatDate(lease.startDate.toDate())}</DataTableCell>
        <DataTableCell>{formatDate(lease.endDate.toDate())}</DataTableCell>

        <DataTableCell alignEnd className="money">
          {formatCents(lease.rent)}
        </DataTableCell>
        <DataTableCell alignEnd className="money">
          {formatCents(lease.balance)}
        </DataTableCell>
      </DataTableRow>
      {activated && (
        <Suspense
          fallback={
            <EmptyTableRowWrapper>
              <Spinner />
            </EmptyTableRowWrapper>
          }
        >
          <Transactions leaseId={lease.id} />
        </Suspense>
      )}
    </Fragment>
  )
}

function Transactions({ leaseId }) {
  const { activeCompany } = useContext(AuthContext).claims
  const [show, setShow] = useState('ALL')
  const where = useMemo(
    () => {
      if (show === 'ALL') {
        return
      }
      const where = []
      if (show === 'PAYMENT') {
        where.push(['type', '==', 'PAYMENT'])
      }
      if (show === 'CHARGE') {
        where.push(['type', '==', 'CHARGE'])
      }
      return where
    },
    [show]
  )
  const params = { activeCompany, leaseId, where }
  return (
    <DataTableRow>
      <DataTableCell style={{ padding: '2.5em' }} colSpan={NUM_COLUMNS}>
        <Expanded>
          <Flex
            className="titleWrap"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <H3>Transactions</H3>
            <RadioGroup
              label="Show"
              selectedValue={show}
              onChange={e => setShow(e.target.value)}
              inline
            >
              <Radio label="All" value="ALL" />
              <Radio label="Payments" value="PAYMENT" inline />
              <Radio label="Charges" value="CHARGE" inline />
            </RadioGroup>
            <Button icon={<MaterialIcon icon="add" />}>New transaction</Button>
          </Flex>
          <Suspense fallback={<Spinner />}>
            <TableData params={params} />
          </Suspense>
        </Expanded>
      </DataTableCell>
    </DataTableRow>
  )
}

function TableData({ params }) {
  const transactions = TransactionsResource.read(params)

  return (
    <Table numRows={transactions.length}>
      <Column
        name="Type"
        cellRenderer={rowIndex => {
          const t = transactions[rowIndex]
          return (
            <Cell>
              <>
                {
                  <Tag
                    minimal
                    style={{
                      color: '#fff',
                      background:
                        t.type === 'PAYMENT' ? Colors.GREEN1 : Colors.BLUE1,
                    }}
                  >
                    {t.type}
                    {`${t.subType ? ':' + t.subType.replace('_', ' ') : ''}`}
                  </Tag>
                }
              </>
            </Cell>
          )
        }}
      />
      <Column
        name="Date"
        cellRenderer={rowIndex => {
          const t = transactions[rowIndex]
          return <Cell>{formatDate(t.date.toDate())}</Cell>
        }}
      />
      <Column
        name="Amount"
        style={{
          textAlign: 'right',
          fontFamily: 'Roboto Mono',
        }}
        cellRenderer={rowIndex => {
          const t = transactions[rowIndex]
          return (
            <Cell
              style={{
                color: t.type === 'PAYMENT' ? Colors.GREEN1 : Colors.BLUE1,
              }}
            >
              {formatCents(`${t.type === 'PAYMENT' ? '-' : ''}${t.amount}`)}
            </Cell>
          )
        }}
      />
    </Table>
  )
}

const StyledTabBar = styled(TabBar)`
  max-width: 18rem;
  background-color: #fff;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
`

const StyledTable = styled(RmwcDataTable)`
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border: none;
  &,
  table {
    width: 100%;
  }
  /* max-width: 60rem; */
  min-width: ${TABLE_MIN_WIDTH};
  min-height: 25rem;
  background-color: #fff;

  tr.leaseRow,
  tr.transactionRow {
    cursor: pointer;
  }
  td.money {
    font-family: 'Roboto Mono';

    &.CHARGE {
      color: initial;
    }
    &.PAYMENT {
      color: darkgreen;
    }
    &.LATE_FEE {
      color: red;
    }
  }
  p {
    margin: 0.5em 0;
  }
`

const FullCellWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Expanded = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  .titleWrap {
    flex-shrink: 0;
    margin-bottom: 0.5em;
  }
  .title {
    margin: 1rem 0;
  }
`
