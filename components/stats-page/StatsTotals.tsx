import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { formatBalanceDisplay, tokenPrecision } from '../../utils/index'
import useMangoStats from '../../hooks/useMangoStats'

const icons = {
  BTC: '/assets/icons/btc.svg',
  ETH: '/assets/icons/eth.svg',
  SOL: '/assets/icons/sol.svg',
  SRM: '/assets/icons/srm.svg',
  USDT: '/assets/icons/usdt.svg',
  USDC: '/assets/icons/usdc.svg',
  WUSDT: '/assets/icons/usdt.svg',
}

export default function StatsTotals() {
  const { latestStats, stats } = useMangoStats()

  return (
    <>
      <div className="md:flex md:flex-col min-w-full">
        <Table className="min-w-full divide-y divide-th-bkg-2">
          <Thead>
            <Tr className="text-th-fgd-3 text-xs">
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Asset
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Total Deposits
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Total Borrows
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Deposit Interest
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Borrow Interest
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Utilization
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {latestStats.map((stat, index) => (
              <Tr
                key={stat.symbol}
                className={`border-b border-th-bkg-2
                  ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                `}
              >
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  <div className="flex items-center">
                    <img
                      src={icons[stat.symbol]}
                      alt={icons[stat.symbol]}
                      width="20"
                      height="20"
                      className="mr-2.5"
                    />
                    {stat.symbol}
                  </div>
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  {formatBalanceDisplay(
                    stat.totalDeposits,
                    tokenPrecision[stat.symbol]
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: tokenPrecision[stat.symbol],
                  })}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  {formatBalanceDisplay(
                    stat.totalBorrows,
                    tokenPrecision[stat.symbol]
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: tokenPrecision[stat.symbol],
                  })}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  {stat.depositInterest.toFixed(2)}%
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  {stat.borrowInterest.toFixed(2)}%
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-th-fgd-1">
                  {(parseFloat(stat.utilization) * 100).toFixed(2)}%
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  )
}
