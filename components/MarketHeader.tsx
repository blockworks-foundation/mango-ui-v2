import React from 'react'
import numeral from 'numeral'
import styled from '@emotion/styled'
import useMarketList from '../hooks/useMarketList'
import useMangoStore from '../stores/useMangoStore'
import useMarkPrice from '../hooks/useMarkPrice'
import { isEqual } from '../utils/'
import UiLock from './UiLock'
import ManualRefresh from './ManualRefresh'
import DropMenu from './DropMenu'

const MarketHeader = () => {
  const { spotMarkets } = useMarketList()
  const markPrice = useMarkPrice()
  const selectedMarketName = useMangoStore((s) => s.selectedMarket.name)
  const marginAccount = useMangoStore((s) => s.selectedMarginAccount.current)
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMangoGroupMarkets = useMangoStore(
    (s) => s.selectedMangoGroup.markets
  )
  const setMangoStore = useMangoStore((s) => s.set)

  const markets = Object.entries(spotMarkets).map(([name]) => {
    return {
      name: name,
      icon: (
        <img
          alt=""
          width="20"
          height="20"
          src={`/assets/icons/${name.split('/')[0].toLowerCase()}.svg`}
        />
      ),
    }
  })

  const handleChange = (mktName) => {
    const newMarket = Object.entries(selectedMangoGroupMarkets).find(
      (m) => m[0] == spotMarkets[mktName]
    )[1]
    setMangoStore((state) => {
      state.selectedMarket.current = newMarket
      state.selectedMarket.name = mktName
      state.selectedMarket.address = spotMarkets[mktName]
    })
  }

  return (
    <div className={`flex items-center justify-between pt-4 px-6 md:px-9`}>
      <div className="flex items-center">
        <div className="pr-6">
          <DropMenu
            button={
              <div className="flex items-center py-1.5 rounded-md">
                <img
                  alt=""
                  width="20"
                  height="20"
                  src={`/assets/icons/${selectedMarketName
                    .split('/')[0]
                    .toLowerCase()}.svg`}
                  className={`mr-2`}
                />

                <div className="font-semibold pr-1 text-lg">
                  {selectedMarketName.split('/')[0]}
                </div>
                <span className="text-th-fgd-4 text-lg">/</span>
                <div className="font-semibold pl-1 pr-2 text-lg">
                  {selectedMarketName.split('/')[1]}
                </div>
              </div>
            }
            buttonClassName="border border-th-bkg-3 default-transition px-2 tracking-wider hover:border-th-fgd-4"
            value={selectedMarketName}
            onChange={(selectedMarketName) => handleChange(selectedMarketName)}
            options={markets}
            showChevrons
          />
        </div>
        <div>
          <div className="text-th-fgd-4 text-xs">Mark price</div>
          <div className="font-semibold mt-0.5">
            {numeral(markPrice).format('0,0.00')}
          </div>
        </div>
        <ChangePercentage change={11} />
        <div>
          <div className="text-th-fgd-4 text-xs">24hr Vol</div>
          <div className={`font-semibold mt-0.5`}>
            {numeral(2000000).format('0,0')}
          </div>
        </div>
      </div>
      <div className="flex">
        <UiLock />
        {connected && marginAccount ? <ManualRefresh className="pl-2" /> : null}
      </div>
    </div>
  )
}

export default MarketHeader

const ChangePercentage = React.memo<{ change: number }>(
  ({ change }) => {
    // const previousChange: number = usePrevious(change)

    return (
      <div className="px-6">
        <div className="text-th-fgd-4 text-xs">24hr Change</div>
        <div
          className={`font-semibold mt-0.5 ${
            change > 0
              ? `text-th-green`
              : change < 0
              ? `text-th-red`
              : `text-th-fgd-1`
          }`}
        >
          {change > 0 && <span className={`text-th-green`}>+</span>}
          {change < 0 && <span className={`text-th-red`}>-</span>}
          {`${change}%` || '--'}
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps, ['change'])
)
