import { useEffect, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import LeaderboardTable from '../components/LeaderboardTable'
import { LinkButton } from '../components/Button'

export default function Leaderboard() {
  const [offsetResults, setOffsetResults] = useState(0)
  const actions = useMangoStore((s) => s.actions)
  const pnlLeaderboard = useMangoStore((s) => s.pnlLeaderboard)

  useEffect(() => {
    actions.fetchPnlLeaderboard(offsetResults, 30)
  }, [])

  const handleShowMore = async () => {
    const offset = offsetResults + 25
    await actions.fetchPnlLeaderboard(offset, 30)
    setOffsetResults(offset)
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`font-semibold text-th-fgd-1 text-2xl`}>
            Leaderboard
          </h1>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          <p className="mb-0">Top 100 accounts by PNL over the last 30 days</p>
          <LeaderboardTable />
          {pnlLeaderboard.length < 100 ? (
            <LinkButton
              className="flex h-10 items-center justify-center mt-1 text-th-primary w-full"
              onClick={() => handleShowMore()}
            >
              Show More
            </LinkButton>
          ) : null}
        </div>
      </PageBodyContainer>
    </div>
  )
}
