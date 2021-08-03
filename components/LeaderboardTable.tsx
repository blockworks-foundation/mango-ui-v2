import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { AreaChart, Area, ReferenceLine, XAxis, YAxis, Tooltip } from 'recharts'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { usdFormatter } from '../utils'
import { AwardIcon, TrophyIcon } from './icons'
import useMangoStore from '../stores/useMangoStore'

const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const StyledTooltipWrapper = styled.div`
  min-width: 180px;
`

const LeaderboardTable = () => {
  const [pnlHistory, setPnlHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const pnlLeaderboard = useMangoStore((s) => s.pnlLeaderboard)

  /* API Returns:
   * [ {  cumulative_pnl: -3.687498
          date: "2021-06-10"
          margin_account: "J8XtwLVyZjeH1PG1Nnk9cWbLn3zEemS1rCbn4x6AjtXM"
          name: ""
          owner: "APLKzSqJQw79q4U4ipBWnLdqkVzijSPNpDCNKwL8mW3B"
      }, ... ]
   */
  useEffect(() => {
    const getPnlHistory = async () => {
      setLoading(true)
      const start = dayjs().utc().subtract(31, 'day').format('YYYY-MM-DD')
      console.log(start)
      const results = await Promise.all(
        pnlLeaderboard.slice(pnlHistory.length).map(async (acc) => {
          const response = await fetch(
            `https://mango-transaction-log.herokuapp.com/stats/pnl_history/${acc.margin_account}?start_date=${start}`
          )
          const parsedResponse = await response.json()
          return parsedResponse ? parsedResponse.reverse() : []
        })
      )
      setPnlHistory(pnlHistory.concat(results))
      setLoading(false)
    }
    getPnlHistory()
  }, [pnlLeaderboard])

  const formatPnlHistoryData = (data) => {
    const start = new Date(
      dayjs().utc().hour(0).minute(0).subtract(31, 'day')
    ).getTime()

    return data.filter((d) => new Date(d.date).getTime() > start)
  }

  const tooltipContent = (tooltipProps) => {
    if (tooltipProps.payload.length > 0) {
      return (
        <StyledTooltipWrapper className="bg-th-bkg-1 flex p-2 rounded">
          <div>
            <div className="text-th-fgd-3 text-xs">Date</div>
            <div className="font-bold text-th-fgd-1 text-xs">
              {tooltipProps.payload[0].payload.date}
            </div>
          </div>
          <div className="pl-3">
            <div className="text-th-fgd-3 text-xs">PNL</div>
            <div className="font-bold text-th-fgd-1 text-xs">
              {usdFormatter.format(
                tooltipProps.payload[0].payload.cumulative_pnl
              )}
            </div>
          </div>
        </StyledTooltipWrapper>
      )
    }
    return null
  }

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
                      className={`px-6 py-3 text-right font-normal`}
                    >
                      PNL
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-right font-normal`}
                    >
                      PNL / Time
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-right font-normal`}
                    >
                      <div className="flex items-center justify-start md:justify-end">
                        <span>View on Step</span>
                        <img
                          alt=""
                          width="20"
                          height="20"
                          src="/assets/icons/step.png"
                          className={`ml-1`}
                        />
                      </div>
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
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1 w-8`}
                      >
                        <div className="flex items-center">
                          {acc.rank}
                          {acc.rank === 1 ? (
                            <TrophyIcon className="h-5 w-5 ml-1.5 text-th-primary" />
                          ) : null}
                          {acc.rank === 2 || acc.rank === 3 ? (
                            <AwardIcon className="h-5 w-5 ml-1.5 text-th-primary-dark" />
                          ) : null}
                        </div>
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-left text-sm text-th-fgd-1 md:w-1/3`}
                      >
                        {acc.name
                          ? acc.name
                          : `${acc.margin_account.slice(
                              0,
                              5
                            )}...${acc.margin_account.slice(-5)}`}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <div className="flex md:justify-end">
                          {usdFormatter.format(acc.pnl)}
                        </div>
                      </Td>
                      <Td
                        className={`flex justify-end px-6 py-3 whitespace-nowrap`}
                      >
                        {loading && !pnlHistory[index] ? (
                          <div className="animate-pulse bg-th-fgd-4 h-14 opacity-10 rounded-md w-44" />
                        ) : (
                          <AreaChart
                            width={176}
                            height={56}
                            data={
                              pnlHistory[index]
                                ? formatPnlHistoryData(pnlHistory[index])
                                : null
                            }
                          >
                            <ReferenceLine
                              y={0}
                              stroke="#FF9C24"
                              strokeDasharray="3 3"
                              strokeOpacity={0.6}
                            />
                            <Area
                              isAnimationActive={false}
                              type="monotone"
                              dataKey="cumulative_pnl"
                              stroke="#FF9C24"
                              fill="#FF9C24"
                              fillOpacity={0.1}
                            />
                            <XAxis dataKey="date" hide />
                            <YAxis dataKey="cumulative_pnl" hide />
                            <Tooltip
                              content={tooltipContent}
                              position={{ x: 0, y: -50 }}
                            />
                          </AreaChart>
                        )}
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
