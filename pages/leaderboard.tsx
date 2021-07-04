import { useEffect, useState } from 'react'
import { ChartBarIcon, HashtagIcon } from '@heroicons/react/outline'
import useMangoStore from '../stores/useMangoStore'
import { usdFormatter } from '../utils'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import LeaderboardTable from '../components/LeaderboardTable'
import { LinkButton } from '../components/Button'

export default function Leaderboard() {
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState(null)
  const [offsetResults, setOffsetResults] = useState(0)
  const actions = useMangoStore((s) => s.actions)
  const accountPnl = useMangoStore((s) => s.accountPnl)
  const pnlLeaderboard = useMangoStore((s) => s.pnlLeaderboard)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  useEffect(() => {
    actions.fetchPnlLeaderboard()
  }, [])

  useEffect(() => {
    actions.fetchPnlByAccount(null, timeRange)
  }, [selectedMarginAccount])

  const handleShowMore = async () => {
    const offset = offsetResults + 25
    await actions.fetchPnlLeaderboard(offset, timeRange)
    setOffsetResults(offset)
  }

  const handleFilterByDate = async (range?: number) => {
    if (range) {
      setLoading(true)
      await actions.fetchPnlLeaderboard(0, range)
      if (selectedMarginAccount) {
        await actions.fetchPnlByAccount(null, range)
      }
      setLoading(false)
      setOffsetResults(0)
      setTimeRange(range)
    } else {
      setLoading(true)
      await actions.fetchPnlLeaderboard(0)
      if (selectedMarginAccount) {
        await actions.fetchPnlByAccount()
      }
      setLoading(false)
      setOffsetResults(0)
      setTimeRange(null)
    }
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Leaderboard
          </h1>
          <div className="flex items-center">
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                timeRange === 7
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={timeRange === 7}
              onClick={() => handleFilterByDate(7)}
            >
              7D
            </button>
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                timeRange === 30
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={timeRange === 30}
              onClick={() => handleFilterByDate(30)}
            >
              30D
            </button>
            <button
              className={`bg-th-bkg-3 px-2 py-1 ml-2 rounded-md cursor-pointer default-transition font-normal focus:outline-none
              ${
                !timeRange
                  ? `ring-1 ring-inset ring-th-primary text-th-primary`
                  : `text-th-fgd-1 opacity-50 hover:opacity-100`
              }
            `}
              disabled={!timeRange}
              onClick={() => handleFilterByDate()}
            >
              All
            </button>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          {selectedMarginAccount && accountPnl && accountPnl.rank ? (
            <>
              <div className="pb-4">
                <div className="text-th-fgd-1 text-lg">Your Ranking</div>
                <div className="text-th-fgd-3 text-xs">
                  {timeRange ? `Last ${timeRange} days` : 'All Time'}
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
                      <div className="flex items-center">
                        <HashtagIcon className="flex-shrink-0 h-5 w-5 text-th-primary" />
                        <div className="text-lg text-th-fgd-1">
                          {accountPnl.rank}
                        </div>
                      </div>
                    </div>
                    <div className="bg-th-bkg-3 p-3 rounded-md">
                      <div className="pb-0.5 text-xs text-th-fgd-3">PNL</div>
                      <div className="flex items-center">
                        <ChartBarIcon className="flex-shrink-0 h-5 w-5 mr-2 text-th-primary" />
                        <div className="text-lg text-th-fgd-1">
                          {usdFormatter.format(accountPnl.pnl)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
          <div className="pb-2 md:pb-0">
            <div className="pb-0.5 text-th-fgd-1 text-lg">
              Top 100 Accounts by PNL
            </div>
            <div className="text-th-fgd-3 text-xs">
              {timeRange ? `Last ${timeRange} days` : 'All Time'}
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
            <>
              <LeaderboardTable />
              {pnlLeaderboard.length < 100 ? (
                <LinkButton
                  className="flex h-10 items-center justify-center mt-1 w-full"
                  onClick={() => handleShowMore()}
                >
                  Show More
                </LinkButton>
              ) : null}
            </>
          )}
        </div>
      </PageBodyContainer>
    </div>
  )
}
