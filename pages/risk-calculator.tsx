import { ChevronUpIcon, RefreshIcon } from '@heroicons/react/outline'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { Disclosure } from '@headlessui/react'
import styled from '@emotion/styled'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import Button, { LinkButton } from '../components/Button'
import Input from '../components/Input'
import Slider from '../components/Slider'
import { useState, useEffect } from 'react'
import Tooltip from '../components/Tooltip'
import { floorToDecimal, roundToDecimal, tokenPrecision, usdFormatter } from '../utils/index'

const StyledJokeWrapper = styled.div`
  width: calc(100% - 2rem);
`

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

  const [assetBars, setAssetBars] = useState<ScenarioDetailCalculator>()
  const [sliderPercentage, setSliderPercentage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, toggleEditing] = useState(false)
  const [pricesLastLength, setPricesLastLength] = useState(0)
  const [connectedStatus, setconnectedStatus] = useState(false)
  const [currentMarginAccount, setCurrentMarginAccount] = useState(null)

  useEffect(() => {
    if (prices.length > pricesLastLength) {
      setLoading(true)
      setSliderPercentage(50)
      initilizeScenario()
      setPricesLastLength(prices.length)
    }
    if (connected != connectedStatus) {
      setLoading(true)
      setSliderPercentage(50)
      initilizeScenario()
      setconnectedStatus(connected)
    }
    if (connected && currentMarginAccount != selectedMarginAccount) {
      setLoading(true)
      setSliderPercentage(50)
      initilizeScenario()
      setCurrentMarginAccount(selectedMarginAccount)
    }
  }, [connected, prices, selectedMarginAccount])

  const initilizeScenario = () => {
    setSliderPercentage(50)
    let assetBarData
    connected && selectedMarginAccount && prices.length > 0
      ? (assetBarData = Object.entries(symbols).map(([assetName], i) => {
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
              ? floorToDecimal(
                  selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
                  tokenPrecision[assetName]
                )
              : 0,
            net: selectedMarginAccount
              ? (floorToDecimal(
                  selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
                  tokenPrecision[assetName]
                ) -
                  floorToDecimal(
                    selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
                    tokenPrecision[assetName]
                  )) *
                prices[i]
              : 0,
            precision: tokenPrecision[assetName],
            priceDisabled: assetName === 'USDC' ? true : false,
          }
        }))
      : (assetBarData = Object.entries(symbols).map(([assetName], i) => {
          return {
            price: prices[i],
            assetName: assetName,
            deposit: 0,
            borrow: 0,
            net: 0,
            precision: tokenPrecision[assetName],
            priceDisabled: assetName === 'USDC' ? true : false,
          }
        }))

    const initScenarioData = updateScenario(assetBarData)
    setAssetBars(initScenarioData)
    setLoading(false)
  }

  const updateScenario = (rowData: AssetBar[]) => {
    return {
      rowData: rowData,
    } as ScenarioDetailCalculator
  }

  const updateScenarioValue = (assetName, field, val) => {
    if (!Number.isNaN(val)) {
      const updatedRowData = assetBars.rowData.map((asset) => {
        if (asset.assetName == assetName) {
          let updatedNet: number
          switch (field) {
            case 'deposit':
              updatedNet = (Math.abs(val) - asset.borrow) * asset.price
              break
            case 'borrow':
              updatedNet = (asset.deposit - Math.abs(val)) * asset.price
              break
            case 'price':
              updatedNet = (asset.deposit - asset.borrow) * Math.abs(val)
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
  }

  const updatePriceValues = (assetName, assetPrice) => {
    const updatedRowData = assetBars.rowData.map((asset) => {
      let val
      asset.assetName === assetName
       ? val = assetPrice
       : val = asset.priceDisabled ? Math.abs(asset.price) : ((Math.abs(asset.price) * sliderPercentage * 2) / 100)
      const updatedNet = (asset.deposit - asset.borrow) * Math.abs(val)
      return { ...asset, ['price']: val, net: updatedNet }
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
          resetValue = connected
            ? selectedMarginAccount
              ? floorToDecimal(
                  selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
                  tokenPrecision[asset.assetName]
                )
              : 0
            : 0
          resetNet = (resetValue - asset.borrow) * prices[i]
          break
        case 'borrow':
          resetValue = connected
            ? selectedMarginAccount
              ? floorToDecimal(
                  selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
                  tokenPrecision[asset.assetName]
                )
              : 0
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
    if (assetBars) {
      const scenarioHashMap = new Map()
      scenarioHashMap.set(
        'liabilities',
        floorToDecimal(
          assetBars.rowData.reduce(
            (a, b) =>
              b.priceDisabled
                ? a + (Math.abs(b.borrow) || 0) * Math.abs(b.price)
                : a +
                  ((Math.abs(b.borrow) || 0) *
                    Math.abs(b.price) *
                    sliderPercentage *
                    2) /
                    100,
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
                ? a + (Math.abs(b.deposit) || 0) * Math.abs(b.price)
                : a +
                  ((Math.abs(b.deposit) || 0) *
                    Math.abs(b.price) *
                    sliderPercentage *
                    2) /
                    100,
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
          : floorToDecimal(
              scenarioHashMap.get('liabilities') /
                scenarioHashMap.get('equity'),
              2
            )
      )
      scenarioHashMap.set(
        'collateralRatio',
        scenarioHashMap.get('liabilities') == 0
          ? 0
          : 
              scenarioHashMap.get('assets') /
                scenarioHashMap.get('liabilities') >
                9.99
                ? 999
                : scenarioHashMap.get('liabilities') == 0
                ? 0
                : (scenarioHashMap.get('assets') /
                    scenarioHashMap.get('liabilities')) *
                  100
      )
      scenarioHashMap.set(
        'maintCollateralRatio',
        connected ? (selectedMangoGroup.maintCollRatio * 100).toFixed(0) : 110
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
        <div className="flex flex-col pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`mb-2 text-th-fgd-1 text-2xl font-semibold`}>
            Risk Calculator
          </h1>
          <p className="mb-0">
            Keep your collateral ratio above 110% to avoid being hunted down by
            liquidators
          </p>
        </div>
        {!loading && assetBars && prices.length > 0 ? (
          <div className="rounded-lg bg-th-bkg-2">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-8 p-4">
                <div className="flex justify-between pb-2 lg:pb-3 px-0 lg:px-3">
                  <div className="pb-4 lg:pb-0 text-th-fgd-1 text-lg">
                    Scenario Balances
                  </div>
                  <div className="flex justify-between lg:justify-start">
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
                <div className="bg-th-bkg-1 border border-th-fgd-4 flex items-center mb-6 lg:mx-3 px-3 h-8 rounded">
                  <div className="pr-5 text-th-fgd-3 text-xs whitespace-nowrap">
                    Edit All Prices
                  </div>
                  <div className="-mt-1.5 w-full">
                    <Slider
                      hideButtons
                      onChange={(e) => {
                        onChangeSlider(e)
                      }}
                      step={0.5}
                      value={sliderPercentage}
                    />
                  </div>
                  <div className="pl-4 text-th-fgd-1 text-xs w-16">
                    {`${sliderPercentage * 2 - 100}%`}
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
                              className={`px-1 lg:px-3 py-1 text-left font-normal`}
                            >
                              Asset
                            </Th>
                            <Th
                              scope="col"
                              className={`px-1 lg:px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-start md:justify-between">
                                <div className="pr-2">Deposits</div>
                                <LinkButton
                                  onClick={() => resetScenarioColumn('deposit')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-1 lg:px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-start md:justify-between">
                                <div className="pr-2">Borrows</div>
                                <LinkButton
                                  onClick={() => resetScenarioColumn('borrow')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-1 lg:px-3 py-1 font-normal`}
                            >
                              <div className="flex justify-start md:justify-between">
                                <div className="pr-2">Price</div>
                                <LinkButton
                                  onClick={() => resetScenarioColumn('price')}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-1 lg:px-3 py-1 text-left font-normal`}
                            >
                              Collateral Weight
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {assetBars.rowData.map((asset, i) => (
                            <Tr
                              className={`
                            ${
                              i % 2 === 0
                                ? `bg-th-bkg-3 md:bg-th-bkg-2`
                                : `bg-th-bkg-2`
                            }
                          `}
                              key={`${i}`}
                            >
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1 w-24`}
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
                                className={`px-1 lg:px-3 py-2 text-sm text-th-fgd-1`}
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
                                className={`px-1 lg:px-3 py-2 text-sm text-th-fgd-1`}
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
                                className={`px-1 lg:px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                {editing ? (
                                  <Input
                                    type="number"
                                    onChange={(e) => {
                                      updatePriceValues(
                                        asset.assetName,
                                        e.target.value
                                      )
                                      setSliderPercentage(50)
                                    }}
                                    value={
                                      asset.priceDisabled
                                        ? (asset.price || 0).toFixed(2)
                                        : (
                                            roundToDecimal((asset.price *
                                              sliderPercentage *
                                              2) /
                                              100, 2)
                                          )
                                    }
                                    onBlur={() => {
                                      toggleEditing(false)
                                    }}
                                    disabled={asset.priceDisabled}
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    onFocus={() => {
                                      toggleEditing(true)
                                    }}
                                    readyOnly={true}
                                    onChange={() => null}
                                    value={
                                      asset.priceDisabled
                                        ? (asset.price || 0).toFixed(2)
                                        : (
                                          roundToDecimal((asset.price *
                                              sliderPercentage *
                                              2) /
                                              100
                                          , 2)).toFixed(2)
                                    }
                                    disabled={asset.priceDisabled}
                                  />
                                )}
                              </Td>
                              <Td
                                className={`px-1 lg:px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="text"
                                  value={
                                    asset.priceDisabled
                                      ? asset.net.toLocaleString(
                                          navigator.language,
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )
                                      : (
                                          (asset.net * sliderPercentage * 2) /
                                          100
                                        ).toLocaleString(navigator.language, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
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
              {!loading && assetBars && prices.length > 0 ? (
                <div className="bg-th-bkg-3 col-span-4 hidden md:block p-4 relative rounded-r-lg">
                  <div className="pb-4 text-th-fgd-1 text-lg">
                    Scenario Details
                  </div>
                  <StyledJokeWrapper className="absolute bottom-0">
                    {scenarioDetails.get('liabilities') === 0 ? (
                      <div className="border border-th-green flex flex-col items-center mb-6 p-3 rounded text-center text-th-fgd-1">
                        <div className="pb-0.5 text-th-fgd-1">
                          0 Borrows = 0 Risk
                        </div>
                        <div className="text-th-fgd-3 text-xs">
                          Come on, live a little...
                        </div>
                      </div>
                    ) : null}
                    {scenarioDetails.get('riskRanking') === 'Low' &&
                    scenarioDetails.get('collateralRatio') !== 0 ? (
                      <div className="border border-th-green flex flex-col items-center mb-6 p-3 rounded text-center text-th-fgd-1">
                        <div className="pb-0.5 text-th-fgd-1">Looking good</div>
                        <div className="text-th-fgd-3 text-xs">
                          Sun is shining, the weather is sweet, yeah
                        </div>
                      </div>
                    ) : null}
                    {scenarioDetails.get('riskRanking') === 'Moderate' ? (
                      <div className="border border-th-orange flex flex-col items-center mb-6 p-3 rounded text-center text-th-fgd-1">
                        <div className="pb-0.5 text-th-fgd-1">
                          Liquidator activity is increasing
                        </div>
                        <div className="text-th-fgd-3 text-xs">
                          It might be time to re-think your positions
                        </div>
                      </div>
                    ) : null}
                    {scenarioDetails.get('riskRanking') === 'High' &&
                    scenarioDetails.get('collateralRatio') >
                      scenarioDetails.get('maintCollateralRatio') ? (
                      <div className="border border-th-red flex flex-col items-center mb-6 p-3 rounded text-center text-th-fgd-1">
                        <div className="pb-0.5 text-th-fgd-1">
                          Liquidators are closing in
                        </div>
                        <div className="text-th-fgd-3 text-xs">
                          Hit &apos;em with everything you&apos;ve got...
                        </div>
                      </div>
                    ) : null}
                    {scenarioDetails.get('collateralRatio') <=
                      scenarioDetails.get('maintCollateralRatio') &&
                    ((scenarioDetails.get('collateralRatio') !== 0  || scenarioDetails.get('leverage') < 0 )  || scenarioDetails.get('leverage') < 0 ) ? (
                      <div className="bg-th-red border border-th-red flex flex-col items-center mb-6 p-3 rounded text-center text-th-fgd-1">
                        <div className="pb-0.5 text-th-fgd-1">Liquidated!</div>
                        <div className="text-th-fgd-1 text-xs">
                          Insert coin to continue...
                        </div>
                      </div>
                    ) : null}
                  </StyledJokeWrapper>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Account Value</div>
                    <div className="font-bold">
                      {usdFormatter.format(scenarioDetails.get('equity'))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Account Risk</div>
                    {
                      <div
                        className={`font-bold ${
                          scenarioDetails.get('riskRanking') === 'High'
                            ? 'text-th-red'
                            : scenarioDetails.get('riskRanking') === 'Moderate'
                            ? 'text-th-orange'
                            : 'text-th-green'
                        }`}
                      >
                        {scenarioDetails.get('collateralRatio') <=
                          scenarioDetails.get('maintCollateralRatio') &&
                        (scenarioDetails.get('collateralRatio') !== 0  || scenarioDetails.get('leverage') < 0 )
                          ? 'Liquidated'
                          : scenarioDetails.get('riskRanking')}
                      </div>
                    }
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Deposit Value</div>
                    <div className="font-bold">
                      {usdFormatter.format(scenarioDetails.get('assets'))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="text-th-fgd-3">Borrow Value</div>
                    <div className="font-bold">
                      {usdFormatter.format(scenarioDetails.get('liabilities'))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <div className="text-th-fgd-3">Collateral Ratio</div>
                      <div className="font-bold">
                        {scenarioDetails.get('collateralRatio').toFixed(0)}%
                      </div>
                    </div>
                    {scenarioDetails.get('liabilities') === 0 ||
                    (scenarioDetails.get('collateralRatio') <=
                      scenarioDetails.get('maintCollateralRatio') &&
                      (scenarioDetails.get('collateralRatio') !== 0  || scenarioDetails.get('leverage') < 0 )) ? null : (
                      <>
                        <div className="flex items-center justify-between pb-3">
                          <div className="text-th-fgd-3">Leverage</div>
                          <div className="font-bold">
                            {scenarioDetails.get('leverage')}x
                          </div>
                        </div>
                        <div className="flex items-center justify-between pb-3">
                          <Tooltip content="The percentage change in total asset value which would result in the liquidation of your account.">
                            <div className="text-th-fgd-3">
                              Price Change Buffer
                            </div>
                          </Tooltip>
                          <div className="font-bold">
                            {scenarioDetails.get('percentToLiquidation')}%
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="animate-pulse bg-th-bkg-3 h-64 rounded-lg w-full" />
        )}
      </PageBodyContainer>
      {!loading && assetBars && prices.length > 0 ? (
        <div className="bg-th-bkg-3 bottom-0 md:hidden sticky w-full">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="bg-th-bkg-3 default-transition flex items-center justify-between p-3 w-full hover:bg-th-bkg-1 focus:outline-none">
                  Scenario Details
                  <ChevronUpIcon
                    className={`default-transition h-4 text-th-fgd-1 w-4 ${
                      open ? 'transform rotate-180' : 'transform rotate-360'
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="p-3">
                  <div className="text-th-fgd-1">
                    <div className="flex items-center justify-between pb-3">
                      <div className="text-th-fgd-3">Account Value</div>
                      <div className="font-bold">
                        {usdFormatter.format(scenarioDetails.get('equity'))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-3">
                      <div className="text-th-fgd-3">Account Risk</div>
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
                          {scenarioDetails.get('collateralRatio') <=
                            scenarioDetails.get('maintCollateralRatio') &&
                          (scenarioDetails.get('collateralRatio') !== 0  || scenarioDetails.get('leverage') < 0 )
                            ? 'Liquidated'
                            : scenarioDetails.get('riskRanking')}
                        </div>
                      }
                    </div>
                    <div className="flex items-center justify-between pb-3">
                      <div className="text-th-fgd-3">Deposit Value</div>
                      <div className="font-bold">
                        {usdFormatter.format(scenarioDetails.get('assets'))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-3">
                      <div className="text-th-fgd-3">Borrow Value</div>
                      <div className="font-bold">
                        {usdFormatter.format(
                          scenarioDetails.get('liabilities')
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <div className="text-th-fgd-3">Collateral Ratio</div>
                        <div className="font-bold">
                          {scenarioDetails.get('collateralRatio')}%
                        </div>
                      </div>
                      {scenarioDetails.get('liabilities') === 0 ||
                      (scenarioDetails.get('collateralRatio') <=
                        scenarioDetails.get('maintCollateralRatio') &&
                        (scenarioDetails.get('collateralRatio') !== 0  || scenarioDetails.get('leverage') < 0 )) ? null : (
                        <>
                          <div className="flex items-center justify-between pb-3">
                            <div className="text-th-fgd-3">Leverage</div>
                            <div className="font-bold">
                              {scenarioDetails.get('leverage')}x
                            </div>
                          </div>
                          <div className="flex items-center justify-between pb-3">
                            <Tooltip content="The percentage change in total asset value which would result in the liquidation of your account.">
                              <div className="text-th-fgd-3">
                                Price Change Buffer
                              </div>
                            </Tooltip>
                            <div className="font-bold">
                              {scenarioDetails.get('percentToLiquidation')}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      ) : null}
    </div>
  )
}
