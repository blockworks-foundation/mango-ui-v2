import { useEffect, useState, useMemo } from 'react'
import { nativeToUi } from '@blockworks-foundation/mango-client/lib/utils'
import { groupBy } from '../utils'
import useTradeHistory from '../hooks/useTradeHistory'
import useMangoStore from '../stores/useMangoStore'
import FloatingElement from './FloatingElement'
import Tooltip from './Tooltip'
import Button from './Button'
import AlertsModal from './AlertsModal'

const calculatePNL = (tradeHistory, prices, mangoGroup) => {
  if (!tradeHistory.length) return '0.00'
  const profitAndLoss = {}
  const groupedTrades = groupBy(tradeHistory, (trade) => trade.marketName)
  if (!prices.length) return '-'

  const assetIndex = {
    'BTC/USDC': 0,
    'ETH/USDC': 1,
    'SOL/USDC': 2,
    'SRM/USDC': 3,
    USDC: 4,
  }

  groupedTrades.forEach((val, key) => {
    profitAndLoss[key] = val.reduce(
      (acc, current) =>
        (current.side === 'sell' ? current.size * -1 : current.size) + acc,
      0
    )
  })

  const totalNativeUSDC = tradeHistory.reduce((acc, current) => {
    const usdtAmount =
      current.side === 'sell'
        ? parseInt(current.nativeQuantityReleased)
        : parseInt(current.nativeQuantityPaid) * -1

    return usdtAmount + acc
  }, 0)

  profitAndLoss['USDC'] = nativeToUi(
    totalNativeUSDC,
    mangoGroup.mintDecimals[assetIndex['USDC']]
  )

  let total = 0
  for (const assetName in profitAndLoss) {
    total = total + profitAndLoss[assetName] * prices[assetIndex[assetName]]
  }

  return total.toFixed(2)
}

export default function MarginInfo() {
  const connection = useMangoStore((s) => s.connection.current)
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const tradeHistory = useTradeHistory()
  const tradeHistoryLength = useMemo(() => tradeHistory.length, [tradeHistory])
  const [mAccountInfo, setMAccountInfo] = useState<
    | {
        label: string
        value: string
        unit: string
        desc: string
        currency: string
      }[]
    | null
  >(null)
  const [openAlertModal, setOpenAlertModal] = useState(false)

  useEffect(() => {
    if (selectedMangoGroup) {
      selectedMangoGroup.getPrices(connection).then((prices) => {
        const accountEquity = selectedMarginAccount
          ? selectedMarginAccount.computeValue(selectedMangoGroup, prices)
          : 0
        const assetsVal = selectedMarginAccount
          ? selectedMarginAccount.getAssetsVal(selectedMangoGroup, prices)
          : 0
        const liabsVal = selectedMarginAccount
          ? selectedMarginAccount.getLiabsVal(selectedMangoGroup, prices)
          : 0
        const collateralRatio = selectedMarginAccount
          ? assetsVal / liabsVal
          : 10
        const leverage = accountEquity
          ? (1 / (collateralRatio - 1)).toFixed(2)
          : '0'

        setMAccountInfo([
          {
            label: 'Equity',
            value: accountEquity.toFixed(2),
            unit: '',
            currency: '$',
            desc: 'The value of the account',
          },
          {
            label: 'Leverage',
            value: leverage,
            unit: 'x',
            currency: '',
            desc: 'Total position size divided by account value',
          },
          {
            label: 'Total PNL',
            value: calculatePNL(tradeHistory, prices, selectedMangoGroup),
            unit: '',
            currency: '$',
            desc: 'Total PNL reflects trades but not liquidations. Visit the Learn link in the top menu for more information.',
          },
          {
            label: 'Current Assets Value',
            value: assetsVal.toFixed(2),
            unit: '',
            currency: '$',
            desc: 'The current value of all your assets',
          },
          {
            label: 'Current Liabilities Value',
            value: liabsVal.toFixed(2),
            unit: '',
            currency: '$',
            desc: 'The current value of all your liabilities',
          },
          {
            label: 'Collateral Ratio',
            value:
              collateralRatio > 9.99
                ? '>999'
                : (collateralRatio * 100).toFixed(0),
            unit: '%',
            currency: '',
            desc: 'Keep your collateral ratio above 110% to avoid liquidation and above 120% to open new margin positions',
          },
        ])
      })
    }
  }, [selectedMarginAccount, selectedMangoGroup, tradeHistoryLength])

  return (
    <FloatingElement showConnect>
      <>
        {mAccountInfo
          ? mAccountInfo.map((entry, i) => (
              <div className={`flex justify-between pt-2 pb-2`} key={i}>
                <Tooltip content={entry.desc}>
                  <div
                    className={`cursor-help font-normal text-th-fgd-4 border-b border-th-fgd-4 border-dashed border-opacity-20 leading-4 default-transition hover:border-th-bkg-2 hover:text-th-fgd-3`}
                  >
                    {entry.label}
                  </div>
                </Tooltip>
                <div className={`text-th-fgd-1`}>
                  {entry.currency + entry.value}
                  {entry.unit}
                </div>
              </div>
            ))
          : null}
        <Button
          className="mt-4 w-full"
          disabled={!connected}
          onClick={() => setOpenAlertModal(true)}
        >
          Create Liquidation Alert
        </Button>
        {openAlertModal ? (
          <AlertsModal
            isOpen={openAlertModal}
            onClose={() => setOpenAlertModal(false)}
            marginAccount={selectedMarginAccount}
          />
        ) : null}
      </>
    </FloatingElement>
  )
}
