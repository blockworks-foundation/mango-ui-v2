import { useEffect, useState } from 'react'
import useMangoStore from '../../stores/useMangoStore'
import TradeHistoryTable from '../TradeHistoryTable'
import DepositWithdrawTable from '../DepositWithdrawHistoryTable'
import LiquidationHistoryTable from '../LiquidationHistoryTable'

const historyViews = ['Trades', 'Deposits', 'Withdrawals', 'Liquidations']

export default function AccountHistory() {
  const actions = useMangoStore((s) => s.actions)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const [view, setView] = useState('Trades')

  useEffect(() => {
    actions.fetchDepositHistory()
    actions.fetchWithdrawalHistory()
    actions.fetchLiquidationHistory()
  }, [selectedMarginAccount])

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:items-end md:justify-between pb-3.5">
        <div className="text-th-fgd-1 text-lg">{view.slice(0, -1)} History</div>
        <div className="flex pb-4 md:pb-0">
          {historyViews.map((section) => (
            <div
              className={`px-3 py-1.5 mx-1 rounded cursor-pointer default-transition bg-th-bkg-3 text-center w-1/4 md:w-auto
                ${
                  view === section
                    ? `ring-1 ring-inset ring-th-primary text-th-primary`
                    : `text-th-fgd-1 opacity-70 hover:opacity-100`
                }
                `}
              onClick={() => setView(section)}
              key={section as string}
            >
              {section}
            </div>
          ))}
        </div>
      </div>
      <ViewContent view={view} />
    </>
  )
}

const ViewContent = ({ view }) => {
  switch (view) {
    case 'Trades':
      return <TradeHistoryTable />
    case 'Deposits':
      return <DepositWithdrawTable type="deposits" />
    case 'Withdrawals':
      return <DepositWithdrawTable type="withdrawals" />
    case 'Liquidations':
      return <LiquidationHistoryTable />
    default:
      return <TradeHistoryTable />
  }
}
