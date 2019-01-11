import React, { Suspense, useContext, useMemo, useState } from 'react'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import styled from '@emotion/styled'
import { Cell, Column, Table } from '@blueprintjs/table'
import {
  Tag,
  Colors,
  H3,
  RadioGroup,
  Radio,
  Button as BlueprintButton,
  FormGroup,
} from '@blueprintjs/core'
import { addYears, subYears, parse } from 'date-fns'
import { DateInput } from '@blueprintjs/datetime'

import { DataTableRow, DataTableCell } from '@rmwc/data-table'
import '@rmwc/data-table/data-table.css'

import { TransactionsResource } from '../firebase/Collection'
import { formatCents, formatDate } from '../utils/format'
import { LEASE_ROW_NUM_COLS } from '../utils/constants'
import { AuthContext } from '../firebase/Auth'
import { Flex } from '../widgets/Flex'
import { Spinner } from '../Spinner'

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

export default function Transactions({ leaseId }) {
  const { activeCompany } = useContext(AuthContext).claims
  const [show, setShow] = useState('ALL')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
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
      <DataTableCell style={{ padding: '2.5em' }} colSpan={LEASE_ROW_NUM_COLS}>
        <Expanded>
          {showTransactionForm ? (
            <TransactionForm closeForm={() => setShowTransactionForm(false)} />
          ) : (
            <>
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
                <Button
                  onClick={() => setShowTransactionForm(true)}
                  icon={<MaterialIcon icon="add" />}
                >
                  New transaction
                </Button>
              </Flex>
              <Suspense fallback={<Spinner />}>
                <TableData params={params} />
              </Suspense>
            </>
          )}
        </Expanded>
      </DataTableCell>
    </DataTableRow>
  )
}

function TransactionForm({ closeForm }) {
  const now = new Date()
  const [txnDate, setTxnDate] = useState(now)
  return (
    <>
      <Flex
        className="titleWrap"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <H3>New Transaction</H3>
        <BlueprintButton onClick={closeForm} icon="cross" minimal />
      </Flex>
      <form
        onSubmit={e =>
          e.preventDefault() ||
          console.log({ txnDate: txnDate.toLocaleDateString() })
        }
      >
        <DateSelector
          label="Transaction date"
          value={txnDate}
          onChange={newDate => setTxnDate(newDate)}
        />
        <BlueprintButton type="submit" intent="primary">
          Save
        </BlueprintButton>
      </form>
    </>
  )
}

function DateSelector({ value, onChange, label }) {
  // const [isEditing, setIsEditing] = useState(false)
  const now = new Date()
  const maxDate = useMemo(() => {
    return addYears(now, 5)
  }, [])
  const minDate = useMemo(() => {
    return subYears(now, 5)
  }, [])

  return (
    <FormGroup label={label}>
      <DateInput
        formatDate={d => d.toLocaleDateString()}
        parseDate={str => console.log(str) || parse(str, 'MM/dd/yyyy', now)}
        placeholder="MM/DD/YYYY"
        value={value}
        onChange={onChange}
        maxDate={maxDate}
        minDate={minDate}
        showActionsBar
      />
      {/* {isEditing ? (
        <DateButtonWrap>
          <DatePicker
            className={`${Classes.ELEVATION_1} picker`}
            value={value}
            maxDate={maxDate}
            onChange={onChange}
          />
          <BlueprintButton intent="primary" onClick={() => setIsEditing(false)}>
            Close
          </BlueprintButton>
        </DateButtonWrap>
      ) : (
        <BlueprintButton icon="calendar" onClick={() => setIsEditing(true)}>
          {formatDate(value)}
        </BlueprintButton>
      )} */}
    </FormGroup>
  )
}

// const DateButtonWrap = styled.div`
//   display: inline-flex;
//   flex-direction: column;
//   align-items: flex-start;
//   .picker {
//     margin-bottom: 1em;
//   }
// `

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
