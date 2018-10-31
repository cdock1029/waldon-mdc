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
import { formatCents } from '../utils/money'
import { NoData } from '../NoData'
import { Flex } from '../widgets/Flex'
import { useCollection } from '../firebase/Collection'
import { QueryContext } from '../Location'

const ACTIVE = 'ACTIVE'
const INACTIVE = 'INACTIVE'

function buildIt({ q, activeTab }) {
  let where = [['status', '==', activeTab]]
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

function useWhereParam() {
  const q = useContext(QueryContext)
  const [activeTab, setActiveTab] = useState(ACTIVE)
  const [where, setWhere] = useState(buildIt({ q, activeTab: ACTIVE }))
  useEffect(
    () => {
      setWhere(buildIt({ q, activeTab }))
    },
    [activeTab, q]
  )

  function toggleActiveTab() {
    setActiveTab(activeTab === ACTIVE ? INACTIVE : ACTIVE)
  }
  return [where, toggleActiveTab]
  /* const str = propertyId
    ? `properties/${propertyId}${unitId ? `/units/${unitId}` : ''}`
    : tenantId
      ? `tenants/${tenantId}`
      : ''
  const ref = getDocRef(str)[0]
  console.log({ str, REF: ref })
  return [['propertyList', 'array-contains', ref]]
  */
}

export const DataTable = () => {
  const [sortDir, setSortDir] = useState(null)
  const [activated, setActivated] = useState(null)
  const [where, toggleActiveTab] = useWhereParam()
  console.log([...where])
  const data = useCollection({
    path: 'leases',
    options: { where },
  })
  function handleSortChange(sortDir) {
    setSortDir(sortDir)
  }
  function handleRowClick(i) {
    setActivated(activated === i ? null : i)
  }
  if (!data) {
    return null
  }
  if (!data.length) {
    return <NoData label="Leases" />
  }
  return (
    <div>
      <StyledTabBar>
        <Tab>Active</Tab>
        <Tab>Inactive</Tab>
      </StyledTabBar>
      <StyledTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Tenants</DataTableHeadCell>
              <DataTableHeadCell>Active</DataTableHeadCell>
              <DataTableHeadCell sort={sortDir} onSortChange={handleSortChange}>
                Properties
              </DataTableHeadCell>
              <DataTableHeadCell>Units</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Rent</DataTableHeadCell>
              <DataTableHeadCell alignEnd>Balance</DataTableHeadCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {data.map(
              (l, i) =>
                console.log() || (
                  <LeaseRow
                    key={l.id}
                    lease={l}
                    activated={i === activated}
                    handleRowClick={() => handleRowClick(i)}
                  />
                )
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
        <DataTableCell>{lease.status}</DataTableCell>
        <DataTableCell>
          {Object.values(lease.properties).map((p, i) => (
            <p key={i}>{p.name}</p>
          ))}
        </DataTableCell>
        <DataTableCell>
          {Object.values(lease.units).map((u, i) => (
            <p key={i}>{/* TODO: replace with label */ u.address}</p>
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
      <DataTableCell colSpan="6">
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
                      <Chip>
                        <ChipText>{t.type}</ChipText>
                      </Chip>
                      {t.subType && (
                        <Chip>
                          <ChipText>{t.subType.replace('_', ' ')}</ChipText>
                        </Chip>
                      )}
                    </ChipSet>
                  </DataTableCell>
                  <DataTableCell>
                    {t.date.toDate().toDateString()}
                  </DataTableCell>
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
  max-width: 900px;

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
`

const Expanded = styled.div`
  label: Expanded;
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  /* max-height: 40rem;
  overflow-y: scroll; */
  .titleWrap {
    flex-shrink: 0;
  }
  .title {
    margin: 1rem 0;
  }
  /* max-height: 30rem;
  overflow-y: scroll; */
  /* max-height: 0px;
  overflow: hidden;
  transition: max-height 200ms ease-in;
  &.expanded {
    max-height: 100vh;
  } */
`
