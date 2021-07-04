import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { usdFormatter } from '../utils'
import { AwardIcon, TrophyIcon } from './icons'
import useMangoStore from '../stores/useMangoStore'

const LeaderboardTable = () => {
  const pnlLeaderboard = useMangoStore((s) => s.pnlLeaderboard)
  return (
    <div className={`flex flex-col py-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
          {pnlLeaderboard.length > 0 ? (
            <div className={`shadow overflow-hidden border-b border-th-bkg-2`}>
              <Table className={`min-w-full divide-y divide-th-bkg-2`}>
                <Thead>
                  <Tr className="text-th-fgd-3 text-xs">
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      Rank
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      Account
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      PNL
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pnlLeaderboard.map((acc, index) => (
                    <Tr
                      key={acc.margin_account}
                      className={`border-b border-th-bkg-3
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                      `}
                    >
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <div className="flex items-center">
                          {acc.rank}
                          {acc.rank === 1 ? (
                            <TrophyIcon className="h-4 w-4 ml-1.5 text-th-primary" />
                          ) : null}
                          {acc.rank === 2 || acc.rank === 3 ? (
                            <AwardIcon className="h-4 w-4 ml-1.5 text-th-green" />
                          ) : null}
                        </div>
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {acc.margin_account.slice(0, 5) +
                          '...' +
                          acc.margin_account.slice(-5)}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {usdFormatter.format(acc.pnl)}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <a
                          className="default-transition flex items-center md:justify-end text-th-fgd-2"
                          href={`https://app.step.finance/#/watch/${acc.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>View</span>
                          <ExternalLinkIcon className={`h-4 w-4 ml-1.5`} />
                        </a>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          ) : (
            <div className="pt-2">
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
              <div className="animate-pulse bg-th-bkg-3 h-10 mb-2 rounded-md w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardTable
