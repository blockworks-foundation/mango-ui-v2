import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { AwardIcon, TrophyIcon } from './icons'

const pnlData = [
  {
    nickname: '',
    publicKey: 'BVujVCfyXd6FafA2863EYnExWEZ9e98ARWrPUYbL7Nsa',
    pnl: 1000000,
    volume_30_day: 280000,
  },
  {
    nickname: 'borry',
    publicKey: '9RY8wKH4MtoSmXLtqEAgckEunSdEbnqjGZTWFz1or123',
    pnl: 200000,
    volume_30_day: 290000,
  },
  {
    nickname: 'wippa',
    publicKey: '9RY8wKH4MtoSmXLtqEAgckEunSdEbnqjGZTWFz1or123',
    pnl: 30000,
    volume_30_day: 200000,
  },
  {
    nickname: '',
    publicKey: 'BVujVCfyXd6FafA2863EYnExWEZ9e98ARWrPUYbL7Nsa',
    pnl: 19000,
    volume_30_day: 289000,
  },
  {
    nickname: 'baz',
    publicKey: '9RY8wKH4MtoSmXLtqEAgckEunSdEbnqjGZTWFz1or123',
    pnl: 9000,
    volume_30_day: 290000,
  },
  {
    nickname: 'wtf',
    publicKey: '9RY8wKH4MtoSmXLtqEAgckEunSdEbnqjGZTWFz1or123',
    pnl: 3000,
    volume_30_day: 204000,
  },
]

const LeaderboardTable = () => {
  return (
    <div className={`flex flex-col py-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
          {pnlData && pnlData.length ? (
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
                  {pnlData.map((acc, index) => (
                    <Tr
                      key={acc.publicKey}
                      className={`border-b border-th-bkg-3
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                      `}
                    >
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <div className="flex items-center">
                          {index + 1}
                          {index === 0 ? (
                            <TrophyIcon className="h-4 w-4 ml-1.5 text-th-primary" />
                          ) : null}
                          {index === 1 || index === 2 ? (
                            <AwardIcon className="h-4 w-4 ml-1.5 text-th-green" />
                          ) : null}
                        </div>
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {acc.nickname
                          ? acc.nickname
                          : acc.publicKey.slice(0, 5) +
                            '...' +
                            acc.publicKey.slice(-5)}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        $
                        {acc.pnl.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
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
              No trade history.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardTable
