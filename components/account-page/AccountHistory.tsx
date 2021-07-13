import { useEffect, useReducer, useState } from 'react'
import dayjs from 'dayjs'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import {
  ArrowSmDownIcon,
  ChevronDownIcon,
  EmojiSadIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline'
import { Disclosure } from '@headlessui/react'
import { useSortableData } from '../../hooks/useSortableData'
import useTradeHistory from '../../hooks/useTradeHistory'
import useMangoStore from '../../stores/useMangoStore'
import { tokenPrecision, usdFormatter } from '../../utils'
import { LinkButton } from '../Button'
import TradeHistoryTable from '../TradeHistoryTable'
import DepositWithdrawTable from '../DepositWithdrawHistoryTable'
import LiquidationHistoryTable from '../LiquidationHistoryTable'
import Switch from '../Switch'

const initialFilterSettings = {
  deposits: true,
  withdrawals: true,
  liquidations: true,
  trades: true,
}

export default function AccountHistory() {
  const activityFeed = useMangoStore((s) => s.activityFeed)
  const actions = useMangoStore((s) => s.actions)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const [trades] = useState([])
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

  const [filterSettings, setFilterSettings] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialFilterSettings
  )

  useEffect(() => {
    actions.fetchActivityFeed()
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

  useEffect(() => {
    if (!filterSettings.deposits) {
      items.filter((a) => a.acitivity_type !== 'Deposit')
    }
  }, [filterSettings])

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
      <div className="flex items-center justify-between pb-3.5 pt-1">
        <div className="text-th-fgd-1 text-lg">Activity Feed</div>
        <div className="flex items-center">
          <Switch
            checked={filterSettings.deposits}
            onChange={(checked) => setFilterSettings({ deposits: checked })}
          >
            Deposits
          </Switch>
          <div className="ml-4">
            <Switch
              checked={filterSettings.withdrawals}
              onChange={(checked) =>
                setFilterSettings({ withdrawals: checked })
              }
            >
              Withdrawals
            </Switch>
          </div>
          <div className="ml-4">
            <Switch
              checked={filterSettings.liquidations}
              onChange={(checked) =>
                setFilterSettings({ liquidations: checked })
              }
            >
              Liquidations
            </Switch>
          </div>
          <div className="ml-4">
            <Switch
              checked={filterSettings.trades}
              onChange={(checked) => setFilterSettings({ trades: checked })}
            >
              Trades
            </Switch>
          </div>
        </div>
      </div>
      <div className={`flex flex-col py-4`}>
        <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
          <div
            className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}
          >
            {history.length > 0 ? (
              items.map((transaction, index) => (
                <Disclosure as="div" key={index}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className="w-full focus:outline-none disabled:cursor-default"
                        disabled={
                          transaction.activity_type === 'Deposit' ||
                          transaction.activity_type === 'Withdraw'
                        }
                      >
                        <div
                          className={`flex items-center justify-between px-4 py-3
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                      `}
                        >
                          <div
                            className={`font-normal text-left text-sm text-th-fgd-1 w-1/4`}
                          >
                            {renderTransactionTime(transaction.block_datetime)}
                          </div>
                          <div
                            className={`font-normal text-left text-sm text-th-fgd-1 w-2/4`}
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
                          </div>
                          <div
                            className={`text-right text-sm text-th-fgd-1 w-1/4`}
                          >
                            {transaction.activity_details.usd_equivalent
                              ? transaction.activity_type === 'Withdraw'
                                ? usdFormatter.format(
                                    transaction.activity_details
                                      .usd_equivalent * -1
                                  )
                                : usdFormatter.format(
                                    transaction.activity_details.usd_equivalent
                                  )
                              : transaction.activity_details.out_token_usd
                              ? usdFormatter.format(
                                  transaction.activity_details.out_token_usd *
                                    -1
                                )
                              : transaction.activity_type === 'sell'
                              ? usdFormatter.format(
                                  transaction.activity_details.value * -1
                                )
                              : usdFormatter.format(
                                  transaction.activity_details.value
                                )}
                          </div>
                          {transaction.activity_type === 'Liquidation' ||
                          transaction.activity_type === 'buy' ||
                          transaction.activity_type === 'sell' ? (
                            <ChevronDownIcon
                              className={`default-transition h-5 w-5 ml-3 text-th-primary ${
                                open
                                  ? 'transform rotate-180'
                                  : 'transform rotate-360'
                              }`}
                            />
                          ) : (
                            <div className="h-5 w-5 ml-3" />
                          )}
                        </div>
                      </Disclosure.Button>

                      <Disclosure.Panel>
                        {transaction.activity_type === 'Liquidation' ? (
                          <div
                            className={`border border-th-fgd-4 my-4 p-6 rounded-md ${
                              index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`
                            }`}
                          >
                            <div className="grid grid-flow-col grid-cols-1 grid-rows-6 sm:grid-cols-3 sm:grid-rows-2 md:grid-cols-6 md:grid-rows-1 gap-2 pb-4">
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Liquidated Asset
                                </div>
                                <div className="flex items-center">
                                  <img
                                    alt=""
                                    width="20"
                                    height="20"
                                    src={`/assets/icons/${transaction.activity_details.in_token_symbol.toLowerCase()}.svg`}
                                    className={`mr-2.5`}
                                  />
                                  <div className="text-th-fgd-1">
                                    {
                                      transaction.activity_details
                                        .in_token_symbol
                                    }
                                  </div>
                                </div>
                              </div>
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Price
                                </div>
                                <div className="text-th-fgd-1">
                                  $
                                  {transaction.activity_details.in_token_price.toFixed(
                                    2
                                  )}
                                </div>
                              </div>
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Bailout Amount
                                </div>
                                <div className="text-th-fgd-1">
                                  {transaction.activity_details.in_token_amount.toFixed(
                                    4
                                  )}
                                </div>
                              </div>
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Bailout Value
                                </div>
                                <div className="text-th-fgd-1">
                                  $
                                  {transaction.activity_details.in_token_usd.toFixed(
                                    4
                                  )}
                                </div>
                              </div>
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Liquidator fee
                                </div>
                                <div className="text-th-fgd-1">
                                  $
                                  {transaction.activity_details.liquidation_fee_usd.toFixed(
                                    4
                                  )}
                                </div>
                              </div>
                              <div className="border border-th-fgd-4 p-3 rounded-md">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  Collateral Ratio
                                </div>
                                <div className="text-th-fgd-1">
                                  {(
                                    transaction.activity_details.coll_ratio *
                                    100
                                  ).toFixed(2)}
                                  %
                                </div>
                              </div>
                            </div>
                            <div className={`overflow-hidden`}>
                              <Table className={`min-w-full`}>
                                <Thead>
                                  <Tr className="border-b border-th-fgd-4 text-th-fgd-3 text-xs">
                                    <Th
                                      scope="col"
                                      className={`px-6 py-3 text-left font-normal`}
                                    >
                                      Asset
                                    </Th>
                                    <Th
                                      scope="col"
                                      className={`px-6 py-3 text-left font-normal`}
                                    >
                                      Price
                                    </Th>
                                    <Th
                                      scope="col"
                                      className={`px-6 py-3 text-left font-normal`}
                                    >
                                      <span>Start Deposits</span>
                                    </Th>
                                    <Th
                                      scope="col"
                                      className={`px-6 py-3 text-left font-normal`}
                                    >
                                      <span>Start Borrows</span>
                                    </Th>
                                    <Th
                                      scope="col"
                                      className={`px-6 py-3 text-left font-normal`}
                                    >
                                      <span>Liquidator Transfers</span>
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {transaction.activity_details.balances.map(
                                    (asset, index) => (
                                      <Tr
                                        key={`${index}`}
                                        className={`border-b border-th-fgd-4 h-full md:h-14`}
                                      >
                                        <Td
                                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                                        >
                                          <div className="flex items-center">
                                            <img
                                              alt=""
                                              width="20"
                                              height="20"
                                              src={`/assets/icons/${asset.symbol.toLowerCase()}.svg`}
                                              className={`mr-2.5`}
                                            />
                                            <div>{asset.symbol}</div>
                                          </div>
                                        </Td>
                                        <Td
                                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                                        >
                                          ${asset.price.toFixed(2)}
                                        </Td>
                                        <Td
                                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                                        >
                                          {asset.start_assets.toFixed(4)}
                                        </Td>
                                        <Td
                                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                                        >
                                          {asset.start_liabs.toFixed(4)}
                                        </Td>
                                        <Td
                                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                                        >
                                          {+(
                                            asset.end_assets -
                                            asset.start_assets
                                          ).toFixed(4) +
                                            +(
                                              asset.start_liabs -
                                              asset.end_liabs
                                            ).toFixed(4)}
                                        </Td>
                                      </Tr>
                                    )
                                  )}
                                </Tbody>
                              </Table>
                            </div>
                          </div>
                        ) : null}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))
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
