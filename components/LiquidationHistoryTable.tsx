import { useState } from 'react'
import dayjs from 'dayjs'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import {
  ArrowSmDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EmojiHappyIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline'
import { tokenPrecision } from '../utils'
import { useSortableData } from '../hooks/useSortableData'
import { LinkButton } from './Button'

const LiquidationHistoryTable = () => {
  const [showLiquidationDetail, setShowLiquidationDetail] = useState(null)
  const history = [
    {
      balances: [
        {
          end_assets: 0.0,
          end_liabs: 0.011437638,
          price: 41.6725,
          start_assets: 0.0,
          start_liabs: 0.035563198,
          symbol: 'SOL',
        },
        {
          end_assets: 0.571962,
          end_liabs: 0.0,
          price: 1.0,
          start_assets: 1.627603,
          start_liabs: 0.0,
          symbol: 'USDC',
        },
      ],
      block_datetime: '2021-06-08T22:33:05',
      block_time: 1623184385,
      coll_ratio: 1.0982421777551474,
      in_token_amount: 0.02412556,
      in_token_price: 41.6725,
      in_token_symbol: 'SOL',
      in_token_usd: 1.0053723991,
      liqee: 'FucJ8CAfqSVuPr2zGhDxjyxkYvb5Qd1Maqqbc5JrPbYb',
      liqor: 'Gb3h5Vi66k3ru4ZbDB8FNxiUYmtGs3KYn24Sty6jSbeh',
      liquidation_fee_usd: 0.0502686009,
      mango_group: '2oogpTYm1sp6LPZAWD3bp2wsFpnV2kXL1s52yyFhW5vp',
      out_token_amount: 1.055641,
      out_token_price: 1.0,
      out_token_symbol: 'USDC',
      out_token_usd: 1.055641,
      signature:
        '2fETmRMrMgZGAiynyPSpYGoEeCKLS3498HdnZbMR97PHzbuyECPNJpqgLcLyGLdjiTFyuKUzM3qBTptD6MXxNqi3',
      socialized_losses: false,
    },
    {
      balances: [
        {
          end_assets: 0.0,
          end_liabs: 0.035563176,
          price: 38.136,
          start_assets: 0.0,
          start_liabs: 0.119019088,
          symbol: 'SOL',
        },
        {
          end_assets: 1.627484,
          end_liabs: 0.0,
          price: 1.0,
          start_assets: 4.969293,
          start_liabs: 0.0,
          symbol: 'USDC',
        },
      ],
      block_datetime: '2021-06-08T18:04:01',
      block_time: 1623168241,
      coll_ratio: 1.0948203150285414,
      in_token_amount: 0.083455913,
      in_token_price: 38.136,
      in_token_symbol: 'SOL',
      in_token_usd: 3.1826746982,
      liqee: 'FucJ8CAfqSVuPr2zGhDxjyxkYvb5Qd1Maqqbc5JrPbYb',
      liqor: 'Gb3h5Vi66k3ru4ZbDB8FNxiUYmtGs3KYn24Sty6jSbeh',
      liquidation_fee_usd: 0.1591333018,
      mango_group: '2oogpTYm1sp6LPZAWD3bp2wsFpnV2kXL1s52yyFhW5vp',
      out_token_amount: 3.341808,
      out_token_price: 1.0,
      out_token_symbol: 'USDC',
      out_token_usd: 3.341808,
      signature:
        '5LZXgKPNSLF93pPVvRz12Nanhq6PD2bZSB64V8hZr4Kjyct13ftuqvFTNZ4Uaw1iXsW2iocp5NQMpHEbJGedEtKV',
      socialized_losses: false,
    },
  ]
  const { items, requestSort, sortConfig } = useSortableData(history)

  const renderTransactionTime = (timestamp) => {
    const date = new Date(timestamp)
    return (
      <>
        <div>{date.toLocaleDateString()}</div>
        <div className="text-xs text-th-fgd-3">{date.toLocaleTimeString()}</div>
      </>
    )
  }

  console.log(showLiquidationDetail)

  return (
    <div className={`flex flex-col py-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
          {history.length > 0 ? (
            showLiquidationDetail ? (
              <div className="bg-th-bkg-3 p-3 rounded-md">
                <div
                  className="cursor-pointer default-transition flex items-center text-th-fgd-1 hover:text-th-fgd-3"
                  onClick={() => setShowLiquidationDetail(null)}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-2 text-th-primary" />
                  Back
                </div>
                <div className="pb-1 pt-2 text-center text-lg text-th-fgd-1">
                  Your account was liquidated by{' '}
                  <a
                    className="default-transition inline-flex items-center justify-end text-th-fgd-1 underline hover:no-underline hover:text-th-fgd-3"
                    href={`https://explorer.solana.com/address/${showLiquidationDetail.liqor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${showLiquidationDetail.liqor.slice(
                      0,
                      5
                    )}...${showLiquidationDetail.liqor.slice(-5)}`}
                  </a>
                </div>
                <div className="text-center text-th-fgd-3">
                  {dayjs(showLiquidationDetail.block_datetime).format(
                    'ddd D MMM YYYY'
                  )}{' '}
                  at{' '}
                  {dayjs(showLiquidationDetail.block_datetime).format('h:mma')}
                </div>
              </div>
            ) : (
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
                          onClick={() => requestSort('block_time')}
                        >
                          Time
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'block_time'
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
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('coll_ratio')}
                        >
                          Collateral Ratio
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'coll_ratio'
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
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('symbol')}
                        >
                          Symbol
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'symbol'
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
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('in_token_amount')}
                        >
                          Amount
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'in_token_amount'
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
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('in_token_price')}
                        >
                          Price
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'in_token_price'
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
                        <LinkButton
                          className="flex items-center no-underline"
                          onClick={() => requestSort('liquidation_fee_usd')}
                        >
                          Liquidator Fee
                          <ArrowSmDownIcon
                            className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                              sortConfig?.key === 'liquidation_fee_usd'
                                ? sortConfig.direction === 'ascending'
                                  ? 'transform rotate-180'
                                  : 'transform rotate-360'
                                : null
                            }`}
                          />
                        </LinkButton>
                      </Th>
                      {/* <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      <LinkButton
                        className="flex items-center no-underline"
                        onClick={() => requestSort('liqor')}
                      >
                        Liquidator
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'liqor'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
                    </Th> */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((transaction, index) => (
                      <Tr
                        key={`${index}`}
                        className={`border-b border-th-bkg-3 cursor-pointer default-transition 
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                      hover:bg-th-bkg-1`}
                        onClick={() => setShowLiquidationDetail(transaction)}
                      >
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          {renderTransactionTime(transaction.block_datetime)}
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          {(transaction.coll_ratio * 100).toFixed(2)}%
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          <div className="flex items-center">
                            <img
                              alt=""
                              width="20"
                              height="20"
                              src={`/assets/icons/${transaction.in_token_symbol.toLowerCase()}.svg`}
                              className={`mr-2.5`}
                            />
                            <div>{transaction.in_token_symbol}</div>
                          </div>
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          {transaction.in_token_amount.toFixed(
                            tokenPrecision[transaction.in_token_symbol]
                          )}
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          ${transaction.in_token_price.toFixed(2)}
                        </Td>
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          ${transaction.liquidation_fee_usd.toFixed(2)}
                        </Td>
                        {/* <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {`${transaction.liqor.slice(
                          0,
                          5
                        )}...${transaction.liqor.slice(-5)}`}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <a
                          className="default-transition flex items-center justify-end text-th-fgd-2"
                          href={`https://explorer.solana.com/tx/${transaction.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>Explorer</span>
                          <ExternalLinkIcon className={`h-4 w-4 ml-2`} />
                        </a>
                      </Td> */}
                        <Td
                          className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                        >
                          <ChevronRightIcon className="h-4 w-4 text-th-primary" />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )
          ) : (
            <div
              className={`bg-th-bkg-1 flex items-center py-6 rounded-md text-center text-th-fgd-3 w-full`}
            >
              No liquidations. Happy days
              <EmojiHappyIcon className="h-4 w-4 ml-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiquidationHistoryTable
