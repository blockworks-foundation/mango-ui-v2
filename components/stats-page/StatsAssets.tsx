import { useState } from 'react'
import useMangoStats from '../../hooks/useMangoStats'
import Chart from '../Chart'

const icons = {
  BTC: '/assets/icons/btc.svg',
  ETH: '/assets/icons/eth.svg',
  SOL: '/assets/icons/sol.svg',
  SRM: '/assets/icons/srm.svg',
  USDT: '/assets/icons/usdt.svg',
  USDC: '/assets/icons/usdc.svg',
  WUSDT: '/assets/icons/usdt.svg',
}

const dailyStartTime = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime()
const weeklyStartTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()

const getAverageStats = (stats, startFrom, type) => {
  const timeFilteredStats = stats.filter(
    (d) => new Date(d.time).getTime() > startFrom
  )
  const sum = timeFilteredStats.map((s) => s[type]).reduce((a, b) => a + b, 0)
  const avg = sum / timeFilteredStats.length || 0

  return (avg * 100).toFixed(4)
}

const AverageInterest = ({ periodLabel, statTypeLabel, interest }) => {
  return (
    <>
      <div className="text-2xl font-bold text-center text-th-fgd-4">
        {periodLabel}
      </div>
      <div className="text-center text-th-fgd-3 text-sm mt-1 font-extrabold">
        {statTypeLabel}
      </div>
      <div className="text-center text-3xl mt-3">{interest}%</div>
    </>
  )
}

export default function StatsAssets() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC')
  const { latestStats, stats } = useMangoStats()

  const selectedStatsData = stats.filter(
    (stat) => stat.symbol === selectedAsset
  )

  return (
    <>
      <div className="flex flex-col-reverse items-center sm:flex-row sm:justify-between sm:h-12 mb-4 w-full">
        <AssetHeader asset={selectedAsset} />
        <div className="flex pb-4 sm:pb-0">
          {latestStats.map((stat) => (
            <div
              className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                selectedAsset === stat.symbol
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              onClick={() => setSelectedAsset(stat.symbol)}
              key={stat.symbol as string}
            >
              {stat.symbol}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-flow-col grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-4 pb-8">
        <div
          className="border border-th-bkg-3 relative md:mb-0 p-4 rounded-md"
          style={{ height: '300px' }}
        >
          <Chart
            title="Total Deposits"
            xAxis="time"
            yAxis="totalDeposits"
            data={selectedStatsData}
            labelFormat={(x) =>
              x && x.toLocaleString(undefined, { maximumFractionDigits: 2 })
            }
            type="area"
          />
        </div>
        <div
          className="border border-th-bkg-3 relative p-4 rounded-md"
          style={{ height: '300px' }}
        >
          <Chart
            title="Deposit Interest"
            xAxis="time"
            yAxis="depositInterest"
            data={selectedStatsData}
            labelFormat={(x) => `${(x * 100).toFixed(5)}%`}
            type="bar"
          />
        </div>
        <div
          className="border border-th-bkg-3 relative md:mb-0 p-4 rounded-md"
          style={{ height: '300px' }}
        >
          <Chart
            title="Total Borrows"
            xAxis="time"
            yAxis="totalBorrows"
            data={selectedStatsData}
            labelFormat={(x) =>
              x && x.toLocaleString(undefined, { maximumFractionDigits: 2 })
            }
            type="area"
          />
        </div>
        <div
          className="border border-th-bkg-3 relative p-4 rounded-md"
          style={{ height: '300px' }}
        >
          <Chart
            title="Borrow Interest"
            xAxis="time"
            yAxis="borrowInterest"
            data={selectedStatsData}
            labelFormat={(x) => `${(x * 100).toFixed(5)}%`}
            type="bar"
          />
        </div>
      </div>
      <div className="grid grid-flow-col grid-cols-4 grid-rows-1 gap-4">
        <div className="border border-th-bkg-3 relative p-4 rounded-md">
          <AverageInterest
            periodLabel="24h Avg"
            statTypeLabel="Deposit Interest"
            interest={getAverageStats(
              selectedStatsData,
              dailyStartTime,
              'depositInterest'
            )}
          />
        </div>
        <div className="border border-th-bkg-3 relative p-4 rounded-md">
          <AverageInterest
            periodLabel="7d Avg"
            statTypeLabel="Deposit Interest"
            interest={getAverageStats(
              selectedStatsData,
              weeklyStartTime,
              'depositInterest'
            )}
          />
        </div>
        <div className="border border-th-bkg-3 relative p-4 rounded-md">
          <AverageInterest
            periodLabel="24h Avg"
            statTypeLabel="Borrow Interest"
            interest={getAverageStats(
              selectedStatsData,
              dailyStartTime,
              'borrowInterest'
            )}
          />
        </div>
        <div className="border border-th-bkg-3 relative p-4 rounded-md">
          <AverageInterest
            periodLabel="7d Avg"
            statTypeLabel="Borrow Interest"
            interest={getAverageStats(
              selectedStatsData,
              weeklyStartTime,
              'borrowInterest'
            )}
          />
        </div>
      </div>
    </>
  )
}

const AssetHeader = ({ asset }) => {
  switch (asset) {
    case 'BTC':
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          Bitcoin
        </div>
      )
    case 'ETH':
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          Ethereum
        </div>
      )
    case 'SOL':
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          Solana
        </div>
      )
    case 'SRM':
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          Serum
        </div>
      )
    case 'USDC':
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          USD Coin
        </div>
      )
    default:
      return (
        <div className="flex items-center text-xl text-th-fgd-1">
          <img
            src={icons[asset]}
            alt={icons[asset]}
            width="24"
            height="24"
            className="mr-2.5"
          />
          Bitcoin
        </div>
      )
  }
}
