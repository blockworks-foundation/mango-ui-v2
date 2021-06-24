import { useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import LeaderboardTable from '../components/LeaderboardTable'

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState('All Time')
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Leaderboard
          </h1>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          <div className="flex items-center justify-between pb-4">
            <div>
              <div className="text-th-fgd-1 text-lg">Your Ranking</div>
              <div className="text-th-fgd-4 text-xs">{timeRange}</div>
            </div>
            <div className="flex items-center">
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'Last 7 Days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('Last 7 Days')}
              >
                7D
              </div>
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'Last 30 Days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('Last 30 Days')}
              >
                30D
              </div>
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'All Time'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('All Time')}
              >
                All
              </div>
            </div>
          </div>
          {selectedMarginAccount ? (
            <div className="grid grid-flow-col grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 gap-4 pb-10">
              <div className="bg-th-bkg-3 p-3 rounded-md">
                <div className="pb-0.5 text-xs text-th-fgd-3">PNL</div>
                <div className="text-lg text-th-fgd-1">#123</div>
              </div>
              <div className="bg-th-bkg-3 p-3 rounded-md">
                <div className="pb-0.5 text-xs text-th-fgd-3">Volume</div>
                <div className="text-lg text-th-fgd-1">#213</div>
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div>
              <div className="pb-0.5 text-th-fgd-1 text-lg">
                Top 100 Accounts by PNL
              </div>
              <div className="text-th-fgd-4 text-xs">{timeRange}</div>
            </div>
            <div className="flex items-center">
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'Last 7 Days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('Last 7 Days')}
              >
                7D
              </div>
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'Last 30 Days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('Last 30 Days')}
              >
                30D
              </div>
              <div
                className={`px-2 py-1 ml-2 rounded-md cursor-pointer default-transition bg-th-bkg-3
              ${
                timeRange === 'All Time'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
                onClick={() => setTimeRange('All Time')}
              >
                All
              </div>
            </div>
          </div>
          <LeaderboardTable />
        </div>
      </PageBodyContainer>
    </div>
  )
}
