import React from 'react'
import {
  DataTable as RmwcDataTable,
  DataTableContent,
  DataTableHead,
  DataTableBody,
  DataTableHeadCell,
  DataTableRow,
  DataTableCell,
} from '@rmwc/data-table'
import Component from '@reach/component-component'
import '@rmwc/data-table/data-table.css'
import { Collection } from '../firebase/Collection'
import { Location } from '../Location'

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
}

export const DataTable = () => {
  return (
    <Location>
      {({ q }) => {
        return (
          <Collection path={'leases'} options={{ where: buildWhere(q) }}>
            {({ data }) => {
              return (
                <Component
                  initialState={{ sortDir: null, activated: null }}
                  key={`${q.p}${q.u}${q.t}`}
                >
                  {({ setState, state: { sortDir, activated } }) => (
                    <RmwcDataTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell>Active</DataTableHeadCell>
                            <DataTableHeadCell
                              alignEnd
                              sort={sortDir}
                              onSortChange={sortDir => {
                                setState({ sortDir })
                                console.log(sortDir)
                              }}
                            >
                              Properties (Click Me)
                            </DataTableHeadCell>
                            <DataTableHeadCell alignEnd>
                              Tenants
                            </DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          {data.map(
                            (l, i) =>
                              console.log() || (
                                <DataTableRow
                                  key={l.id}
                                  activated={i === activated}
                                  onClick={() => {
                                    // this.handleSelect(i)
                                    setState(({ activated }) => ({
                                      activated: activated === i ? null : i,
                                    }))
                                  }}
                                >
                                  <DataTableCell>{l.status}</DataTableCell>
                                  <DataTableCell alignEnd>
                                    {Object.values(l.properties).map((p, i) => (
                                      <span key={`${l.id}p${i}`}>{p.name}</span>
                                    ))}
                                  </DataTableCell>
                                  <DataTableCell alignEnd>
                                    {Object.values(l.tenants).map((t, i) => (
                                      <span key={`${l.id}t${i}`}>{t.name}</span>
                                    ))}
                                  </DataTableCell>
                                </DataTableRow>
                              )
                          )}
                        </DataTableBody>
                      </DataTableContent>
                    </RmwcDataTable>
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
