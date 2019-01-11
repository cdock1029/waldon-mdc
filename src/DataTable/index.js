/* @jsx jsx */
// eslint-disable-next-line no-unused-vars
import { jsx, css } from '@emotion/core'
import React, { Fragment, useContext, useState, useMemo, Suspense } from 'react'
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

import { formatCents, formatDate } from '../utils/format'
import { NoData } from '../NoData'
import { LeasesResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'
import { QueryContext } from '../Location'
import { Spinner } from '../Spinner'
import { LEASE_ROW_NUM_COLS } from '../utils/constants'

const Transactions = React.lazy(() => import('../Transactions'))

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
      <TabBar
        activeIndex={activeTabIndex}
        handleActiveIndexUpdate={handleTabChange}
        css={{
          maxWidth: '18rem',
          backgroundColor: '#fff',
          boxShadow:
            '0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)',
        }}
      >
        <Tab>Active</Tab>
        <Tab>Inactive</Tab>
      </TabBar>
      <RmwcDataTable
        css={css`
          box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),
            0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
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
        `}
      >
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
      </RmwcDataTable>
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
      <DataTableCell colSpan={LEASE_ROW_NUM_COLS}>
        <div
          css={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
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
