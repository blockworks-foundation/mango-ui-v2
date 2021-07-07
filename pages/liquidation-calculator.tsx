import { RefreshIcon } from '@heroicons/react/outline'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import Button, { LinkButton } from '../components/Button'
import Input from '../components/Input'
import Slider from '../components/Slider'
import { useState, useEffect } from 'react'
import Tooltip from '../components/Tooltip'
import { floorToDecimal, ceilToDecimal, tokenPrecision } from '../utils/index'

interface AssetBar {
  price: number
  assetName: string
  deposit: number
  borrow: number
  net: number
  precision: number
  priceDisabled: boolean
}

interface ScenarioDetailCalculator {
  rowData: AssetBar[]
}

export default function LiquidationCalculator() {
  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)
  const { symbols } = useMarketList()
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  const [loading, setLoading] = useState(true)
  const [assetBars, setAssetBars] = useState<ScenarioDetailCalculator>()
  const [sliderPercentage, setSliderPercentage] = useState(0)

  useEffect(() => {
    if (connected) {
      if (loading) {
        setSliderPercentage(50)
        initilizeScenario()
        setLoading(false)
      }
    } else {
      setSliderPercentage(50)
      setLoading(true)
    }
  }, [connected, loading])

  const initilizeScenario = () => {
    setSliderPercentage(50)
    const assetBarData = Object.entries(symbols).map(([assetName], i) => {
      return {
        price: prices[i],
        assetName: assetName,
        deposit: selectedMarginAccount
          ? floorToDecimal(
              selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
              tokenPrecision[assetName]
            )
          : 0,
        borrow: selectedMarginAccount
          ? ceilToDecimal(
              selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
              tokenPrecision[assetName]
            )
          : 0,
        net: selectedMarginAccount
          ? (floorToDecimal(
              selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
              tokenPrecision[assetName]
            ) -
              ceilToDecimal(
                selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
                tokenPrecision[assetName]
              )) *
            prices[i]
          : 0,
        precision: tokenPrecision[assetName],
        priceDisabled: assetName === 'USDC' ? true : false,
      }
    })

    const initScenarioData = updateScenario(assetBarData)
    setAssetBars(initScenarioData)
  }

  const updateScenario = (rowData: AssetBar[]) => {
    return {
      rowData: rowData,
    } as ScenarioDetailCalculator
  }

  const updateScenarioValue = (assetName, field, val) => {
    const updatedRowData = assetBars.rowData.map((asset) => {
      if (asset.assetName == assetName) {
        let updatedNet: number
        switch (field) {
          case 'deposit':
            updatedNet = (val - asset.borrow) * asset.price
            break
          case 'borrow':
            updatedNet = (asset.deposit - val) * asset.price
            break
          case 'price':
            updatedNet = (asset.deposit - asset.borrow) * val
            break
        }
        return { ...asset, [field]: val, net: updatedNet }
      } else {
        return asset
      }
    })
    const updatedScenarioData = updateScenario(updatedRowData)
    setAssetBars(updatedScenarioData)
  }

  const resetScenarioColumn = (column) => {
    const resetRowData = assetBars.rowData.map((asset, i) => {
      let resetValue: number
      let resetNet: number
      switch (column) {
        case 'deposit':
          resetValue = selectedMarginAccount
            ? floorToDecimal(
                selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
                tokenPrecision[asset.assetName]
              )
            : 0
          resetNet = (resetValue - asset.borrow) * prices[i]
          break
        case 'borrow':
          resetValue = selectedMarginAccount
            ? ceilToDecimal(
                selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
                tokenPrecision[asset.assetName]
              )
            : 0
          resetNet = (asset.deposit - resetValue) * prices[i]
          break
        case 'price':
          setSliderPercentage(50)
          resetValue = prices[i]
          resetNet = (asset.deposit - asset.borrow) * prices[i]
          break
      }

      return { ...asset, [column]: resetValue, net: resetNet }
    })
    const updatedScenarioData = updateScenario(resetRowData)
    setAssetBars(updatedScenarioData)
  }

  const onChangeSlider = async (percentage) => {
    setSliderPercentage(percentage)
  }

  function getScenarioDetails() {
    if (connected && assetBars && !loading) {
      const scenarioHashMap = new Map()
      scenarioHashMap.set(
        'liabilities',
        ceilToDecimal(
          assetBars.rowData.reduce(
            (a, b) =>
              b.priceDisabled
                ? a + (b.borrow || 0) * b.price
                : a + ((b.borrow || 0) * b.price * sliderPercentage * 2) / 100,
            0
          ),
          2
        )
      )
      scenarioHashMap.set(
        'assets',
        floorToDecimal(
          assetBars.rowData.reduce(
            (a, b) =>
              b.priceDisabled
                ? a + (b.deposit || 0) * b.price
                : a + ((b.deposit || 0) * b.price * sliderPercentage * 2) / 100,
            0
          ),
          2
        )
      )
      scenarioHashMap.set(
        'equity',
        floorToDecimal(
          scenarioHashMap.get('assets') - scenarioHashMap.get('liabilities'),
          2
        )
      )
      scenarioHashMap.set(
        'leverage',
        scenarioHashMap.get('liabilities') == 0
          ? 0.0
          : ceilToDecimal(
              scenarioHashMap.get('liabilities') /
                scenarioHashMap.get('equity'),
              2
            )
      )
      scenarioHashMap.set(
        'collateralRatio',
        scenarioHashMap.get('liabilities') == 0
          ? 0
          : floorToDecimal(
              scenarioHashMap.get('assets') /
                scenarioHashMap.get('liabilities') >
                9.99
                ? 999
                : scenarioHashMap.get('liabilities') == 0
                ? 0
                : (scenarioHashMap.get('assets') /
                    scenarioHashMap.get('liabilities')) *
                  100,
              0
            )
      )
      scenarioHashMap.set(
        'maintCollateralRatio',
        floorToDecimal(selectedMangoGroup.maintCollRatio * 100, 0)
      )
      scenarioHashMap.set(
        'percentToLiquidation',
        scenarioHashMap.get('liabilities') == 0
          ? 100
          : floorToDecimal(
              (1 -
                (scenarioHashMap.get('liabilities') *
                  scenarioHashMap.get('maintCollateralRatio')) /
                  100 /
                  scenarioHashMap.get('assets')) *
                100,
              0
            )
      )
      scenarioHashMap.set(
        'riskRanking',
        scenarioHashMap.get('percentToLiquidation') < 15
          ? 'High'
          : scenarioHashMap.get('percentToLiquidation') < 35
          ? 'Moderate'
          : 'Low'
      )
      return scenarioHashMap
    }
  }

  const scenarioDetails = getScenarioDetails()

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row sm:justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Liquidation Calculator
          </h1>
        </div>
        {connected && assetBars && !loading ? (
          <div className="rounded-lg bg-th-bkg-2">
            <div className="grid grid-cols-12">
              <div className="col-span-9 p-4">
                <div className="flex items-start justify-between pb-8 px-3">
                  <div className="text-th-fgd-1 text-lg">Scenario Balances</div>
                  <div className="flex">
                    <div className="bg-th-bkg-1 border border-th-fgd-4 flex items-center px-3 h-8 rounded">
                      <div className="pr-5 text-th-fgd-3 text-xs">
                        Edit All Prices
                      </div>
                      <div className="-mt-1.5 w-32">
                        <Slider
                          hideButtons
                          onChange={(e) => {
                            onChangeSlider(e)
                          }}
                          step={0.5}
                          value={sliderPercentage}
                        />
                      </div>
                      <div className="pl-4 text-th-fgd-1 text-xs w-12">
                        {`${sliderPercentage * 2}%`}
                      </div>
                    </div>
                    <Button
                      className={`text-xs flex items-center justify-center sm:ml-3 pt-0 pb-0 h-8 pl-3 pr-3 rounded`}
                      onClick={() => initilizeScenario()}
                    >
                      <div className="flex items-center">
                        <RefreshIcon className="h-5 w-5 mr-1.5" />
                        Reset
                      </div>
                    </Button>
                  </div>
                </div>
                <div className={`flex flex-col pb-2`}>
                  <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
                    <div
                      className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}
                    >
                      <Table className="min-w-full divide-y divide-th-bkg-2">
                        <Thead>
                          <Tr className="text-th-fgd-3 text-xs">
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              Asset
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-between">
                                Deposits
                                <LinkButton
                                  onClick={() => resetScenarioColumn('deposit')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-between">
                                Borrows
                                <LinkButton
                                  onClick={() => resetScenarioColumn('borrow')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th scope="col" className={`px-3 py-1 font-normal`}>
                              <div className="flex justify-between">
                                Price ($)
                                <LinkButton
                                  onClick={() => resetScenarioColumn('price')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              Collateral Weight ($)
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {assetBars.rowData.map((asset, i) => (
                            <Tr key={`${i}`}>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <div className="flex items-center">
                                  <img
                                    alt=""
                                    width="20"
                                    height="20"
                                    src={`/assets/icons/${asset.assetName.toLowerCase()}.svg`}
                                    className={`mr-2.5`}
                                  />
                                  <div>{asset.assetName}</div>
                                </div>
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={asset.deposit}
                                  onChange={(e) =>
                                    updateScenarioValue(
                                      asset.assetName,
                                      'deposit',
                                      e.target.value
                                    )
                                  }
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={asset.borrow}
                                  onChange={(e) =>
                                    updateScenarioValue(
                                      asset.assetName,
                                      'borrow',
                                      e.target.value
                                    )
                                  }
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={
                                    asset.priceDisabled
                                      ? asset.price
                                      : (asset.price * sliderPercentage * 2) /
                                        100
                                  }
                                  onChange={(e) =>
                                    updateScenarioValue(
                                      asset.assetName,
                                      'price',
                                      e.target.value
                                    )
                                  }
                                  disabled={asset.priceDisabled}
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="text"
                                  value={
                                    asset.priceDisabled
                                      ? asset.net
                                      : (asset.net * sliderPercentage * 2) / 100
                                  }
                                  onChange={null}
                                  disabled
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
              {connected && assetBars && !loading ? (
                <div className="bg-th-bkg-3 col-span-3 p-4 rounded-r-lg">
                  <div className="pb-4 text-th-fgd-1 text-lg">
                    Scenario Details
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Equity</div>
                    <div className="font-bold">
                      ${scenarioDetails.get('equity')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Assets</div>
                    <div className="font-bold">
                      ${scenarioDetails.get('assets')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Liabilities</div>
                    <div className="font-bold">
                      ${scenarioDetails.get('liabilities')}
                    </div>
                  </div>
                  {scenarioDetails.get('liabilities') === 0 ? (
                    <div className="flex items-center justify-center text-th-green pb-3">
                      Account Safe: No Liabilities
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <div className="text-th-fgd-3">Collateral Ratio</div>
                        <div className="font-bold">
                          {scenarioDetails.get('collateralRatio')}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-3">
                        <Tooltip content="The collateral ratio you must maintain to not get liquidated">
                          <div className="text-th-fgd-3">MCR Required</div>
                        </Tooltip>
                        <div className="font-bold">
                          {scenarioDetails.get('maintCollateralRatio')}%
                        </div>
                      </div>
                      {scenarioDetails.get('collateralRatio') <=
                      scenarioDetails.get('maintCollateralRatio') ? (
                        <div className="flex items-center justify-center text-th-red pb-3">
                          Account Liquidated
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between pb-3">
                            <div className="text-th-fgd-3">Leverage</div>
                            <div className="font-bold">
                              {scenarioDetails.get('leverage')}x
                            </div>
                          </div>
                          <div className="flex items-center justify-between pb-3">
                            <div className="text-th-fgd-3">Risk</div>
                            {
                              <div
                                className={`font-bold ${
                                  scenarioDetails.get('riskRanking') === 'High'
                                    ? 'text-th-red'
                                    : scenarioDetails.get('riskRanking') ===
                                      'Moderate'
                                    ? 'text-th-orange'
                                    : 'text-th-green'
                                }`}
                              >
                                {scenarioDetails.get('riskRanking')}
                              </div>
                            }
                          </div>
                          <div className="flex items-center justify-between pb-3">
                            <Tooltip content="The percentage move in total asset value which would result in the liquidation of your account.">
                              <div className="text-th-fgd-3">
                                Price Move To Liquidate
                              </div>
                            </Tooltip>
                            <div className="font-bold">
                              {scenarioDetails.get('percentToLiquidation')}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-th-bkg-2">
            Please connect a wallet to use this feature
          </div>
        )}
      </PageBodyContainer>
    </div>
  )
}
