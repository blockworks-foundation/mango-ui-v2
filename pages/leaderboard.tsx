import { useEffect, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import { usdFormatter } from '../utils'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import LeaderboardTable from '../components/LeaderboardTable'

export default function Leaderboard() {
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('All Time')
  const [selectedAccountRank, setSelectedAccountRank] = useState(null)
  const actions = useMangoStore((s) => s.actions)
  const pnlLeaderboard = useMangoStore((s) => s.pnlLeaderboard)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  useEffect(() => {
    actions.fetchPnlLeaderboard()
  }, [])

  useEffect(() => {
    if (selectedMarginAccount && pnlLeaderboard.length > 0) {
      const findAccount = pnlLeaderboard.find(
        (acc) =>
          acc.margin_account === selectedMarginAccount.publicKey.toString()
      )
      setSelectedAccountRank(findAccount)
    }
  }, [loading, selectedMarginAccount, pnlLeaderboard])

  const handleFilterByDate = async (range) => {
    if (range === 'all') {
      setLoading(true)
      await actions.fetchPnlLeaderboard()
      setLoading(false)
      setTimeRange(`All Time`)
    } else {
      const startAt = new Date(
        Date.now() - range * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-ZA')
      setLoading(true)
      await actions.fetchPnlLeaderboard(startAt)
      setLoading(false)
      setTimeRange(`Last ${range} days`)
    }
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row sm:justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Leaderboard
          </h1>
          <div className="flex items-center">
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                timeRange === 'Last 7 days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={timeRange === 'Last 7 days'}
              onClick={() => handleFilterByDate(7)}
            >
              7D
            </button>
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                timeRange === 'Last 30 days'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={timeRange === 'Last 30 days'}
              onClick={() => handleFilterByDate(30)}
            >
              30D
            </button>
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                timeRange === 'All Time'
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={timeRange === 'All Time'}
              onClick={() => handleFilterByDate('all')}
            >
              All
            </button>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          {selectedMarginAccount && selectedAccountRank ? (
            <>
              <div className="flex items-center justify-between pb-4">
                <div>
                  <div className="text-th-fgd-1 text-lg">Your Ranking</div>
                  <div className="text-th-fgd-3 text-xs">{timeRange}</div>
                </div>
              </div>
              <div className="grid grid-flow-col grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 gap-4 pb-10">
                {loading ? (
                  <>
                    <div className="animate-pulse bg-th-bkg-3 h-16 rounded-md" />
                    <div className="animate-pulse bg-th-bkg-3 h-16 rounded-md" />
                  </>
                ) : (
                  <>
                    <div className="bg-th-bkg-3 p-3 rounded-md">
                      <div className="pb-0.5 text-xs text-th-fgd-3">Rank</div>
                      <div className="text-lg text-th-fgd-1">
                        #{selectedAccountRank.rank}
                      </div>
                    </div>
                    <div className="bg-th-bkg-3 p-3 rounded-md">
                      <div className="pb-0.5 text-xs text-th-fgd-3">PNL</div>
                      <div className="text-lg text-th-fgd-1">
                        {usdFormatter.format(selectedAccountRank.pnl)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between">
            <div>
              <div className="pb-0.5 text-th-fgd-1 text-lg">
                Top 100 Accounts by PNL
              </div>
              <div className="text-th-fgd-3 text-xs">{timeRange}</div>
            </div>
          </div>
          {loading ? (
            <div className="pt-6">
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
            </div>
          ) : (
            <LeaderboardTable />
          )}
        </div>
      </PageBodyContainer>
    </div>
  )
}
