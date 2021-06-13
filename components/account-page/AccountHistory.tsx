import { useState } from 'react'
import TradeHistoryTable from '../TradeHistoryTable'
import DepositWithdrawTable from '../DepositWithdrawHistoryTable'
import LiquidationHistoryTable from '../LiquidationHistoryTable'

const historyViews = ['Trades', 'Deposits', 'Withdrawals', 'Liquidations']

export default function AccountHistory() {
  const [view, setView] = useState('Trades')
  return (
    <>
      <div className="flex items-center justify-between pb-3.5 sm:pt-1">
        <div className="text-th-fgd-1 text-lg">{view.slice(0, -1)} History</div>
        <div className="flex">
          {historyViews.map((section) => (
            <div
              className={`border px-3 py-1.5 ml-2 rounded cursor-pointer default-transition
              ${
                view === section
                  ? `bg-th-bkg-3 border-th-bkg-3 ring-1 ring-inset ring-th-primary text-th-primary`
                  : `border-th-fgd-4 text-th-fgd-1 opacity-80 hover:opacity-100`
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
      return <DepositWithdrawTable />
    case 'Withdrawals':
      return <DepositWithdrawTable />
    case 'Liquidations':
      return <LiquidationHistoryTable />
    default:
      return <TradeHistoryTable />
  }
}
