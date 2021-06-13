import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { ArrowSmDownIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import { useSortableData } from '../hooks/useSortableData'
import { LinkButton } from './Button'

const DepositWithdrawHistoryTable = () => {
  const history = [
    {
      margin_account: 'FKCBDQwmTj6HeJ1uU93go7xcUN2XX1myeHyzfK5iAj3X',
      signature:
        '2XdcbDFSFpntZBdasLoA6ZhTXXqC9m5nqrwMYYqyHE9yNjQatSeT8CfYKcKATRka2zZ3ja2X6FtCL1DmUSUJq9D5',
      owner: '2qdLBQh3QaNWjmD5fhJjzjVr4M164TfXKxp8SqYym8oZ',
      symbol: 'USDC',
      quantity: 20000.0,
      usd_equivalent: 20000.0,
      block_time: 1623186689,
      block_datetime: '2021-06-08T23:11:29',
      mango_group: '2oogpTYm1sp6LPZAWD3bp2wsFpnV2kXL1s52yyFhW5vp',
    },
    {
      margin_account: 'FKCBDQwmTj6HeJ1uU93go7xcUN2XX1myeHyzfK5iAj3X',
      signature:
        '2A63A9nrQrvZJu4EwPBraPRAz2j6Zrxgybkq7EMk5dhovv9ej3fhnoqmvtb5nvbddoFCs2heX6ZXSb2AzZXu6vBD',
      owner: '2qdLBQh3QaNWjmD5fhJjzjVr4M164TfXKxp8SqYym8oZ',
      symbol: 'USDC',
      quantity: 12000.0,
      usd_equivalent: 12000.0,
      block_time: 1623185318,
      block_datetime: '2021-06-08T22:48:38',
      mango_group: '2oogpTYm1sp6LPZAWD3bp2wsFpnV2kXL1s52yyFhW5vp',
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

  return (
    <div className={`flex flex-col py-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
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
                        onClick={() => requestSort('symbol')}
                      >
                        Asset
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
                        onClick={() => requestSort('quantity')}
                      >
                        Quantity
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'quantity'
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
                        onClick={() => requestSort('usd_equivalent')}
                      >
                        Value
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'usd_equivalent'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
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
                        <div className="flex items-center">
                          <img
                            alt=""
                            width="20"
                            height="20"
                            src={`/assets/icons/${transaction.symbol.toLowerCase()}.svg`}
                            className={`mr-2.5`}
                          />
                          <div>{transaction.symbol}</div>
                        </div>
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {transaction.quantity.toLocaleString()}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {transaction.usd_equivalent.toLocaleString()}
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
              No balances
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DepositWithdrawHistoryTable
