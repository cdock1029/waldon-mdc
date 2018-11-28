import { createFirestoreCollectionResource } from './index'

export const PropertiesResource = createFirestoreCollectionResource(
  ({ activeCompany, propertyId }) => {
    const args = {
      rootPath: `companies/${activeCompany}/properties`,
      path: propertyId,
      orderBy: propertyId ? undefined : ['name', 'asc'],
    }
    return args
  }
)

export const TenantsResource = createFirestoreCollectionResource(
  ({ activeCompany, tenantId }) => {
    return {
      rootPath: `companies/${activeCompany}/tenants`,
      path: tenantId,
      orderBy: tenantId ? undefined : ['lastName', 'asc'],
    }
  }
)

export const UnitsResource = createFirestoreCollectionResource(
  ({ activeCompany, propertyId, unitId }) => {
    return {
      rootPath: `companies/${activeCompany}/properties/${propertyId}/units`,
      path: unitId,
    }
  }
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
  ({ activeCompany, leaseId, where }) => {
    return {
      rootPath: `companies/${activeCompany}/leases/${leaseId}/transactions`,
      orderBy: ['date', 'asc'],
      where,
    }
  }
)

export const TodosResource = createFirestoreCollectionResource(() => ({
  rootPath: 'todos',
  orderBy: ['createdAt'],
}))
