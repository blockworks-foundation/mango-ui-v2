import dynamic from 'next/dynamic'
import { Responsive, WidthProvider } from 'react-grid-layout'

const TVChartContainer = dynamic(
  () => import('../components/TradingView/index'),
  { ssr: false }
)
import { useEffect, useState } from 'react'
import FloatingElement from '../components/FloatingElement'
import Orderbook from '../components/Orderbook'
import MarginInfo from './MarginInfo'
import MarginBalances from './MarginBalances'
import TradeForm from './TradeForm'
import UserInfo from './UserInfo'
import RecentMarketTrades from './RecentMarketTrades'
import useMangoStore from '../stores/useMangoStore'
import useLocalStorageState from '../hooks/useLocalStorageState'

const ResponsiveGridLayout = WidthProvider(Responsive)

export const defaultLayouts = {
  xl: [
    { i: 'tvChart', x: 0, y: 0, w: 6, h: 30 },
    { i: 'orderbook', x: 6, y: 0, w: 3, h: 17 },
    { i: 'tradeForm', x: 9, y: 0, w: 3, h: 13 },
    { i: 'marketTrades', x: 6, y: 1, w: 3, h: 13 },
    { i: 'balanceInfo', x: 9, y: 1, w: 3, h: 15 },
    { i: 'userInfo', x: 0, y: 2, w: 9, h: 19 },
    { i: 'marginInfo', x: 9, y: 2, w: 3, h: 13 },
  ],
  lg: [
    { i: 'tvChart', x: 0, y: 0, w: 8, h: 28, minW: 2 },
    { i: 'balanceInfo', x: 8, y: 0, w: 4, h: 15, minW: 2 },
    { i: 'marginInfo', x: 8, y: 1, w: 4, h: 13, minW: 2 },
    { i: 'orderbook', x: 0, y: 2, w: 4, h: 17, minW: 2 },
    { i: 'tradeForm', x: 4, y: 2, w: 4, h: 17, minW: 3 },
    { i: 'marketTrades', x: 8, y: 2, w: 4, h: 17, minW: 2 },
    { i: 'userInfo', x: 0, y: 3, w: 12, h: 19, minW: 6 },
  ],
  md: [
    { i: 'tvChart', x: 0, y: 0, w: 8, h: 28, minW: 2 },
    { i: 'balanceInfo', x: 8, y: 0, w: 4, h: 15, minW: 2 },
    { i: 'marginInfo', x: 8, y: 1, w: 4, h: 13, minW: 2 },
    { i: 'orderbook', x: 0, y: 2, w: 4, h: 17, minW: 2 },
    { i: 'tradeForm', x: 4, y: 2, w: 4, h: 17, minW: 3 },
    { i: 'marketTrades', x: 8, y: 2, w: 4, h: 17, minW: 2 },
    { i: 'userInfo', x: 0, y: 3, w: 12, h: 19, minW: 6 },
  ],
  sm: [
    { i: 'tvChart', x: 0, y: 0, w: 12, h: 25, minW: 6 },
    { i: 'balanceInfo', x: 0, y: 1, w: 6, h: 15, minW: 2 },
    { i: 'marginInfo', x: 6, y: 1, w: 6, h: 15, minW: 2 },
    { i: 'tradeForm', x: 0, y: 2, w: 12, h: 13, minW: 3 },
    { i: 'orderbook', x: 0, y: 3, w: 6, h: 17, minW: 3 },
    { i: 'marketTrades', x: 6, y: 3, w: 6, h: 17, minW: 2 },
    { i: 'userInfo', x: 0, y: 4, w: 12, h: 19, minW: 6 },
  ],
  xs: [
    { i: 'tvChart', x: 0, y: 0, w: 0, h: 0, minW: 6 },
    { i: 'balanceInfo', x: 0, y: 1, w: 6, h: 15, minW: 2 },
    { i: 'marginInfo', x: 0, y: 2, w: 6, h: 13, minW: 2 },
    { i: 'tradeForm', x: 0, y: 3, w: 12, h: 13, minW: 3 },
    { i: 'orderbook', x: 0, y: 4, w: 6, h: 17, minW: 3 },
    { i: 'marketTrades', x: 0, y: 5, w: 6, h: 17, minW: 2 },
    { i: 'userInfo', x: 0, y: 6, w: 12, h: 19, minW: 6 },
  ],
}

export const GRID_LAYOUT_KEY = 'mangoSavedLayouts-2.2'

const TradePageGrid = () => {
  const { uiLocked } = useMangoStore((s) => s.settings)
  const [savedLayouts, setSavedLayouts] = useLocalStorageState(
    GRID_LAYOUT_KEY,
    defaultLayouts
  )

  const onLayoutChange = (layouts) => {
    if (layouts) {
      setSavedLayouts(layouts)
    }
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={savedLayouts || defaultLayouts}
      breakpoints={{ xl: 1600, lg: 1200, md: 1110, sm: 768, xs: 0 }}
      cols={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 1 }}
      rowHeight={15}
      isDraggable={!uiLocked}
      isResizable={!uiLocked}
      onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
    >
      <div key="tvChart">
        <FloatingElement className="pl-0">
          <TVChartContainer />
        </FloatingElement>
      </div>
      <div key="orderbook">
        <Orderbook />
      </div>
      <div key="tradeForm">
        <TradeForm />
      </div>
      <div key="marginInfo">
        <MarginInfo />
      </div>
      <div key="userInfo">
        <UserInfo />
      </div>
      <div key="balanceInfo">
        <MarginBalances />
      </div>
      <div key="marketTrades">
        <RecentMarketTrades />
      </div>
    </ResponsiveGridLayout>
  )
}

export default TradePageGrid
