import { useEffect, useState } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { ArrowSmDownIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import { Disclosure } from '@headlessui/react'
import { useSortableData } from '../../hooks/useSortableData'
import useTradeHistory from '../../hooks/useTradeHistory'
import useMangoStore from '../../stores/useMangoStore'
import { tokenPrecision, usdFormatter } from '../../utils'
import { LinkButton } from '../Button'
import TradeHistoryTable from '../TradeHistoryTable'
import DepositWithdrawTable from '../DepositWithdrawHistoryTable'
import LiquidationHistoryTable from '../LiquidationHistoryTable'

const historyViews = ['Trades', 'Deposits', 'Withdrawals', 'Liquidations']

export default function AccountHistory() {
  const activityFeed = useMangoStore((s) => s.activityFeed)
  const actions = useMangoStore((s) => s.actions)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const [trades, setTrades] = useState([])
  const [activity, setActivity] = useState([...activityFeed])
  const [view, setView] = useState('Trades')
  const { items, requestSort, sortConfig } = useSortableData(
    [...activityFeed]
      .concat(trades)
      .sort(
        (a, b) =>
          new Date(a.block_datetime).getTime() -
          new Date(b.block_datetime).getTime()
      )
  )
  const tradeHistory = useTradeHistory()

  useEffect(() => {
    actions.fetchActivityFeed()
    // actions.fetchDepositHistory()
    // actions.fetchWithdrawalHistory()
    // actions.fetchLiquidationHistory()
  }, [selectedMarginAccount])

  useEffect(() => {
    if (tradeHistory.length !== trades.length) {
      const newTrades = tradeHistory.slice(
        (tradeHistory.length - trades.length) * -1
      )
      newTrades.forEach((trade) =>
        trades.push({
          activity_details: trade,
          activity_type: trade.side,
          block_datetime: trade.loadTimestamp,
        })
      )
    }
  }, [tradeHistory])

  const renderTransactionTime = (timestamp) => {
    const date = new Date(timestamp)
    return (
      <>
        <div>{date.toLocaleDateString()}</div>
        <div className="text-xs text-th-fgd-3">{date.toLocaleTimeString()}</div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:items-end md:justify-between pb-3.5">
        <div className="text-th-fgd-1 text-lg">{view.slice(0, -1)} History</div>
        <div className="flex pb-4 md:pb-0">
          {historyViews.map((section) => (
            <div
              className={`px-3 py-1.5 mx-1 rounded cursor-pointer default-transition bg-th-bkg-3 text-center w-1/4 md:w-auto
                ${
                  view === section
                    ? `ring-1 ring-inset ring-th-primary text-th-primary`
                    : `text-th-fgd-1 opacity-70 hover:opacity-100`
                }
                `}
              onClick={() => setView(section)}
              key={section as string}
            >
              {section}
            </div>
          ))}
        </div>
      </div>
      <div className={`flex flex-col py-4`}>
        <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
          <div
            className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}
          >
            {history.length > 0 ? (
              <div
                className={`overflow-hidden border-b border-th-bkg-2 sm:rounded-md`}
              >
                <Table className={`min-w-full divide-y divide-th-bkg-2`}>
                  <Thead>
                    <Tr className="text-th-fgd-3 text-xs">
                      <Th
                        scope="col"
                        className={`px-6 py-3 text-left font-normal`}
                      >
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('block_datetime')}
                        >
                          Date/Time
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'block_datetime'
                                ? sortConfig.direction === 'ascending'
                                  ? 'transform rotate-180'
                                  : 'transform rotate-360'
                                : null
                            }`}
                          />
                        </LinkButton>
                      </Th>
                      <Th
                        scope="col"
                        className={`px-6 py-3 text-left font-normal`}
                      >
                        Description
                      </Th>
                      <Th
                        scope="col"
                        className={`px-6 py-3 text-left font-normal`}
                      >
                        Value
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((transaction, index) => (
                      <Tr
                        key={`${index}`}
                        className={`border-b border-th-bkg-3
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                      `}
                      >
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          {renderTransactionTime(transaction.block_datetime)}
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          {transaction.activity_type === 'Deposit' ||
                          transaction.activity_type === 'Withdraw'
                            ? `${
                                transaction.activity_type
                              } ${transaction.activity_details.quantity.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits:
                                    tokenPrecision[
                                      transaction.activity_details.symbol + 1
                                    ],
                                }
                              )} ${transaction.activity_details.symbol}`
                            : null}
                          {transaction.activity_type === 'Liquidation'
                            ? transaction.activity_type
                            : null}
                          {transaction.activity_type === 'buy' ||
                          transaction.activity_type === 'sell'
                            ? `${transaction.activity_type
                                .split()
                                .map(
                                  (w) =>
                                    w[0].toUpperCase() +
                                    w.substr(1).toLowerCase()
                                )} ${transaction.activity_details.size} ${
                                transaction.activity_details.baseCurrency
                              } at ${usdFormatter.format(
                                transaction.activity_details.price
                              )}`
                            : null}
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1 ${
                            transaction.activity_type === 'Liquidation' ||
                            transaction.activity_type === 'Withdraw' ||
                            transaction.activity_type === 'sell'
                              ? 'text-th-red'
                              : 'text-th-green'
                          }`}
                        >
                          {transaction.activity_details.usd_equivalent
                            ? transaction.activity_type === 'Withdraw'
                              ? usdFormatter.format(
                                  transaction.activity_details.usd_equivalent *
                                    -1
                                )
                              : usdFormatter.format(
                                  transaction.activity_details.usd_equivalent
                                )
                            : transaction.activity_details.out_token_usd
                            ? usdFormatter.format(
                                transaction.activity_details.out_token_usd * -1
                              )
                            : transaction.activity_type === 'sell'
                            ? usdFormatter.format(
                                transaction.activity_details.value * -1
                              )
                            : usdFormatter.format(
                                transaction.activity_details.value
                              )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            ) : (
              <div
                className={`w-full text-center py-6 bg-th-bkg-1 text-th-fgd-3 rounded-md`}
              >
                'No withdrawals'
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <ViewContent view={view} /> */}
    </>
  )
}

const ViewContent = ({ view }) => {
  switch (view) {
    case 'Trades':
      return <TradeHistoryTable />
    case 'Deposits':
      return <DepositWithdrawTable type="deposits" />
    case 'Withdrawals':
      return <DepositWithdrawTable type="withdrawals" />
    case 'Liquidations':
      return <LiquidationHistoryTable />
    default:
      return <TradeHistoryTable />
  }
}
