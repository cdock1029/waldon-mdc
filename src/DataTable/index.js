import React, { Fragment } from 'react'
import Component from '@reach/component-component'
import styled, { cx } from 'react-emotion/macro'
import { Typography, Button, ButtonIcon, ChipSet, Chip, ChipText } from 'rmwc'
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
import { Location } from '../Location'
import { NoData } from '../NoData'
import { Flex } from '../widgets/Flex'
import { Collection } from '../firebase/Collection'
// import { getDocRef } from '../firebase'

const StyledTable = styled(RmwcDataTable)`
  label: StyledTable;
  /* box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
    */
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border: none;
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

const ExpandedRow = styled.div`
  label: ExpandedRow;
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

function buildWhere(q) {
  const { p: propertyId, u: unitId, t: tenantId } = q
  const where = [['status', '==', 'ACTIVE']]
  if (propertyId) {
    where.push([`properties.${propertyId}.exists`, '==', true])
    if (unitId) {
      where.push([`units.${unitId}.exists`, '==', true])
    }
  } else if (tenantId) {
    where.push([`tenants.${tenantId}.exists`, '==', true])
  }
  return where
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
  return (
    <Location>
      {({ q }) => {
        return (
          <Collection path={'leases'} options={{ where: buildWhere(q) }}>
            {({ data }) => {
              if (!data.length) {
                return <NoData label="Leases" />
              }
              return (
                <Component
                  initialState={{ sortDir: null, activated: null }}
                  key={`${q.p}${q.u}${q.t}`}
                >
                  {({ setState, state: { sortDir, activated } }) => (
                    <StyledTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell>Tenants</DataTableHeadCell>
                            <DataTableHeadCell>Active</DataTableHeadCell>
                            <DataTableHeadCell
                              sort={sortDir}
                              onSortChange={sortDir => {
                                setState({ sortDir })
                                console.log(sortDir)
                              }}
                            >
                              Properties
                            </DataTableHeadCell>
                            <DataTableHeadCell>Units</DataTableHeadCell>
                            <DataTableHeadCell alignEnd>Rent</DataTableHeadCell>
                            <DataTableHeadCell alignEnd>
                              Balance
                            </DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          {data.map(
                            (l, i) =>
                              console.log() || (
                                <Fragment key={l.id}>
                                  <DataTableRow
                                    className="leaseRow"
                                    activated={i === activated}
                                    onClick={() => {
                                      // this.handleSelect(i)
                                      setState(({ activated }) => ({
                                        activated: activated === i ? null : i,
                                      }))
                                    }}
                                  >
                                    <DataTableCell>
                                      {Object.values(l.tenants).map((t, i) => (
                                        <p key={i}>{t.name}</p>
                                      ))}
                                    </DataTableCell>
                                    <DataTableCell>{l.status}</DataTableCell>
                                    <DataTableCell>
                                      {Object.values(l.properties).map(
                                        (p, i) => (
                                          <p key={i}>{p.name}</p>
                                        )
                                      )}
                                    </DataTableCell>
                                    <DataTableCell>
                                      {Object.values(l.units).map((u, i) => (
                                        <p key={i}>
                                          {
                                            /* TODO: replace with label */ u.address
                                          }
                                        </p>
                                      ))}
                                    </DataTableCell>
                                    <DataTableCell alignEnd className="money">
                                      {formatCents(l.rent)}
                                    </DataTableCell>
                                    <DataTableCell alignEnd className="money">
                                      {formatCents(l.balance)}
                                    </DataTableCell>
                                  </DataTableRow>
                                  {i === activated && (
                                    <Collection
                                      path={`leases/${l.id}/transactions`}
                                      options={{ orderBy: ['date', 'desc'] }}
                                    >
                                      {({ data: transactions }) => {
                                        return (
                                          <DataTableRow>
                                            <DataTableCell colSpan="6">
                                              <ExpandedRow>
                                                <Flex
                                                  className="titleWrap"
                                                  justifyContent="space-between"
                                                  alignItems="center"
                                                >
                                                  <Typography
                                                    className="title"
                                                    use="headline6"
                                                  >
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
                                                      <DataTableHeadCell>
                                                        Type
                                                      </DataTableHeadCell>
                                                      <DataTableHeadCell>
                                                        Date
                                                      </DataTableHeadCell>
                                                      <DataTableHeadCell
                                                        alignEnd
                                                      >
                                                        Amount
                                                      </DataTableHeadCell>
                                                    </DataTableRow>
                                                  </DataTableHead>
                                                  <DataTableBody>
                                                    {transactions.map(t => (
                                                      <DataTableRow
                                                        key={t.id}
                                                        className="transactionRow"
                                                      >
                                                        <DataTableCell>
                                                          <ChipSet>
                                                            <Chip>
                                                              <ChipText>
                                                                {t.type}
                                                              </ChipText>
                                                            </Chip>
                                                            {t.subType && (
                                                              <Chip>
                                                                <ChipText>
                                                                  {t.subType.replace(
                                                                    '_',
                                                                    ' '
                                                                  )}
                                                                </ChipText>
                                                              </Chip>
                                                            )}
                                                          </ChipSet>
                                                        </DataTableCell>
                                                        <DataTableCell>
                                                          {t.date
                                                            .toDate()
                                                            .toDateString()}
                                                        </DataTableCell>
                                                        <DataTableCell
                                                          alignEnd
                                                          className={cx(
                                                            'money',
                                                            t.type,
                                                            t.subType
                                                          )}
                                                        >
                                                          {formatCents(
                                                            `${
                                                              t.type ===
                                                              'PAYMENT'
                                                                ? '-'
                                                                : ''
                                                            }${t.amount}`
                                                          )}
                                                        </DataTableCell>
                                                      </DataTableRow>
                                                    ))}
                                                  </DataTableBody>
                                                </DataTableContent>
                                              </ExpandedRow>
                                            </DataTableCell>
                                          </DataTableRow>
                                        )
                                      }}
                                    </Collection>
                                  )}
                                </Fragment>
                              )
                          )}
                        </DataTableBody>
                      </DataTableContent>
                    </StyledTable>
                  )}
                </Component>
              )
            }}
          </Collection>
        )
      }}
    </Location>
  )
}
