import { createFirestoreCollectionResource } from './index'

export const PropertiesResource = createFirestoreCollectionResource(
  ({ activeCompany, propertyId }) => {
    const args = {
      rootPath: `companies/${activeCompany}/properties`,
      path: propertyId,
      orderBy: propertyId ? undefined : ['name', 'asc'],
    }
    return args
  },
  (a, b) => a.id === b.id && a.name === b.name
)

export const TenantsResource = createFirestoreCollectionResource(
  ({ activeCompany, tenantId }) => {
    return {
      rootPath: `companies/${activeCompany}/tenants`,
      path: tenantId,
      orderBy: tenantId ? undefined : ['lastName', 'asc'],
    }
  },
  (a, b) =>
    a.id === b.id && a.firstName === b.firstName && a.lastName === b.lastName
)

export const UnitsResource = createFirestoreCollectionResource(
  ({ activeCompany, propertyId, unitId }) => {
    console.log({ propertyId })
    return {
      rootPath: `companies/${activeCompany}/properties/${propertyId}/units`,
      path: unitId,
    }
  },
  (a, b) => a.id === b.id && a.label === b.label
)

export const LeasesResource = createFirestoreCollectionResource(
  ({ activeCompany, where }) => {
    return {
      rootPath: `companies/${activeCompany}/leases`,
      where,
    }
  }
)

export const TransactionsResource = createFirestoreCollectionResource(
  ({ activeCompany, leaseId }) => {
    return {
      rootPath: `companies/${activeCompany}/leases/${leaseId}/transactions`,
      orderBy: ['date', 'asc'],
    }
  }
)

export const TodosResource = createFirestoreCollectionResource(() => ({
  rootPath: 'todos',
  orderBy: ['createdAt'],
}))
