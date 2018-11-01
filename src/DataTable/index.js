import React, { Fragment, useContext, useState, useEffect } from 'react'
import styled, { cx } from 'react-emotion/macro'
import {
  Typography,
  Button,
  ButtonIcon,
  ChipSet,
  Chip,
  ChipText,
  TabBar,
  Tab,
} from 'rmwc'
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
import { formatCents, formatDate } from '../utils/format'
import { NoData } from '../NoData'
import { Flex } from '../widgets/Flex'
import { useCollection } from '../firebase/Collection'
import { QueryContext } from '../Location'

const NUM_COLUMNS = 7
const TABLE_MIN_WIDTH = '53rem'
const ACTIVE = 'ACTIVE'
const INACTIVE = 'INACTIVE'
function buildIt({ q, activeTabIndex }) {
  const activeValue = activeTabIndex ? INACTIVE : ACTIVE
  let where = [['status', '==', activeValue]]
  const { p: propertyId, u: unitId, t: tenantId } = q
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

/* const str = propertyId
    ? `properties/${propertyId}${unitId ? `/units/${unitId}` : ''}`
    : tenantId
      ? `tenants/${tenantId}`
      : ''
  const ref = getDocRef(str)[0]
  console.log({ str, REF: ref })
  return [['propertyList', 'array-contains', ref]]
  */

export const DataTable = () => {
  const [sortDir, setSortDir] = useState(null)
  const [activated, setActivated] = useState(null)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const q = useContext(QueryContext)
  const [where, setWhere] = useState(buildIt({ q, activeTabIndex }))
  useEffect(
    () => {
      setActivated(null)
      setWhere(buildIt({ q, activeTabIndex }))
    },
    [activeTabIndex, q]
  )

  // console.table([...where])
  const leases = useCollection({
    path: 'leases',
    options: { where },
  })
  function handleSortChange(sortDir) {
    setSortDir(sortDir)
  }
  function handleRowClick(i) {
    setActivated(activated === i ? null : i)
  }
  function handleTabChange(e) {
    setActiveTabIndex(e.detail.index)
  }
  return (
    <div>
      <StyledTabBar
        activeTabIndex={activeTabIndex}
        onActivate={handleTabChange}
      >
        <Tab>Active</Tab>
        <Tab>Inactive</Tab>
      </StyledTabBar>
      <StyledTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Tenants</DataTableHeadCell>
              <DataTableHeadCell>Start</DataTableHeadCell>
              <DataTableHeadCell>End</DataTableHeadCell>
              <DataTableHeadCell sort={sortDir} onSortChange={handleSortChange}>
                Properties
              </DataTableHeadCell>
              <DataTableHeadCell>Units</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Rent</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Balance</DataTableHeadCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {!leases ? null : leases.length ? (
              leases.map((l, i) => (
                <LeaseRow
                  key={l.id}
                  lease={l}
                  activated={i === activated}
                  handleRowClick={() => handleRowClick(i)}
                />
              ))
            ) : (
              <DataTableRow>
                <DataTableCell colSpan={NUM_COLUMNS}>
                  <div className="full-cell-wrap">
                    <NoData label="Leases" z={0} />
                  </div>
                </DataTableCell>
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTableContent>
      </StyledTable>
    </div>
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
          {Object.values(lease.tenants).map((t, i) => (
            <p key={i}>{t.name}</p>
          ))}
        </DataTableCell>
        <DataTableCell>{formatDate(lease.startDate.toDate())}</DataTableCell>
        <DataTableCell>{formatDate(lease.endDate.toDate())}</DataTableCell>
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
        <DataTableCell alignEnd className="money">
          {formatCents(lease.rent)}
        </DataTableCell>
        <DataTableCell alignEnd className="money">
          {formatCents(lease.balance)}
        </DataTableCell>
      </DataTableRow>
      {activated && <Transactions leaseId={lease.id} />}
    </Fragment>
  )
}

function Transactions({ leaseId }) {
  const transactions = useCollection({
    path: `leases/${leaseId}/transactions`,
    options: {
      orderBy: ['date', 'desc'],
    },
  })
  if (!transactions) {
    return null
  }
  return (
    <DataTableRow>
      <DataTableCell colSpan={NUM_COLUMNS}>
        <Expanded>
          <Flex
            className="titleWrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography className="title" use="headline6">
              Transactions
            </Typography>
            <Button>
              <ButtonIcon icon="add" />
              New transaction
            </Button>
          </Flex>
          <DataTableContent>
            <DataTableHead>
              <DataTableRow>
                <DataTableHeadCell>Type</DataTableHeadCell>
                <DataTableHeadCell>Date</DataTableHeadCell>
                <DataTableHeadCell alignEnd>Amount</DataTableHeadCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {transactions.map(t => (
                <DataTableRow key={t.id} className="transactionRow">
                  <DataTableCell>
                    <ChipSet>
                      {!t.subType && (
                        <StyledChip>
                          <ChipText>{t.type}</ChipText>
                        </StyledChip>
                      )}
                      {t.subType && (
                        <StyledChip>
                          <ChipText>{t.subType.replace('_', ' ')}</ChipText>
                        </StyledChip>
                      )}
                    </ChipSet>
                  </DataTableCell>
                  <DataTableCell>{formatDate(t.date.toDate())}</DataTableCell>
                  <DataTableCell
                    alignEnd
                    className={cx('money', t.type, t.subType)}
                  >
                    {formatCents(
                      `${t.type === 'PAYMENT' ? '-' : ''}${t.amount}`
                    )}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTableContent>
        </Expanded>
      </DataTableCell>
    </DataTableRow>
  )
}

const StyledTabBar = styled(TabBar)`
  max-width: 18rem;
  background-color: #fff;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
`

const StyledTable = styled(RmwcDataTable)`
  label: StyledTable;

  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border: none;
  &,
  table {
    width: 100%;
  }
  /* max-width: 60rem; */
  min-width: ${TABLE_MIN_WIDTH};

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
  .full-cell-wrap {
    display: flex;
    justify-content: center;
  }
`

const Expanded = styled.div`
  label: Expanded;
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  .titleWrap {
    flex-shrink: 0;
  }
  .title {
    margin: 1rem 0;
  }
`

const StyledChip = styled(Chip)`
  font-size: 0.8em;
  line-height: normal;
`
