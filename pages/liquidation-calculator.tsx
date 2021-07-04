import { RefreshIcon } from '@heroicons/react/outline'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../stores/useMangoStore'
import { useBalances } from '../hooks/useBalances'
import useMarketList from '../hooks/useMarketList'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import Button, { LinkButton } from '../components/Button'
import Input from '../components/Input'
import Slider from '../components/Slider'
import { useState, useEffect } from 'react'
import Tooltip from '../components/Tooltip'

export default function LiquidationCalculator() {
  const balances = useBalances()
  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)
  const { symbols } = useMarketList()
  const connected = useMangoStore((s) => s.wallet.connected)

  const [depositValues, setDepositValues] = useState([])
  const [borrowValues, setBorrowValues] = useState([])
  const [priceValues, setPriceValues] = useState([])
  const [depositsInitialized, setDepositsInitialized] = useState(false)
  const [borrowsInitialized, setBorrowsInitialized] = useState(false)
  const [pricesInitialized, setPricesInitialized] = useState(false)
  const [sliderPercentage, setSliderPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connected) {
      InitializeDeposits()
      InitializeBorrows()
      InitializePrices()
      setLoading(false)
    } else {
      setLoading(true)
      setSliderPercentage(50)
    }
  }, [connected])

  // Initialise states
  function InitializeDeposits() {
    let newDepositValues

    {
      prices.length > 0 && balances
        ? (newDepositValues = balances.map((balance) => {
            return balance.marginDeposits
          }))
        : null
    }
    setDepositValues(newDepositValues)
    setDepositsInitialized(true)
  }

  function InitializeBorrows() {
    let newBorrowsValues
    {
      prices.length > 0 && balances
        ? (newBorrowsValues = balances.map((balance) => {
            return balance.borrows
          }))
        : null
    }
    setBorrowValues(newBorrowsValues)
    setBorrowsInitialized(true)
  }

  function InitializePrices() {
    let newPricesValues
    {
      prices.length > 0 && balances
        ? (newPricesValues = prices.map((val) => {
            return val
          }))
        : null
    }
    setPriceValues(newPricesValues)
    setPricesInitialized(true)
  }

  // Set states
  function setDeposit(value, index) {
    const newDepositValues = depositValues.map((val, i) => {
      return i === index ? value : val
    })
    setDepositValues(newDepositValues)
  }

  function setBorrow(value, index) {
    const newBorrowValues = borrowValues.map((val, i) => {
      return i === index ? value : val
    })
    setBorrowValues(newBorrowValues)
  }

  function setPrice(value, index) {
    const newPricesValues = priceValues.map((val, i) => {
      return i === index ? value : val
    })
    setPriceValues(newPricesValues)
  }

  // Get states
  function getDeposit(index) {
    let deposit
    {
      depositsInitialized
        ? (deposit = depositValues[index])
        : InitializeDeposits()
      deposit = depositValues[index]
    }
    return deposit
  }

  function getBorrow(index) {
    let borrow
    {
      borrowsInitialized ? (borrow = borrowValues[index]) : InitializeBorrows()
      borrow = borrowValues[index]
    }
    return borrow
  }

  function getPrice(index) {
    let price
    {
      pricesInitialized ? (price = priceValues[index]) : InitializePrices()
      if (index === 4) {
        price = priceValues[index]
      } else {
        price = (priceValues[index] * sliderPercentage * 2) / 100
      }
    }
    return price
  }

  // Ancilliary functions
  function getCollateralWeight(index) {
    let collWeight
    collWeight =
      depositValues[index] * priceValues[index] -
      borrowValues[index] * priceValues[index]
    if (collWeight > 0) {
      collWeight = collWeight * ((sliderPercentage * 2) / 100)
    }
    return collWeight.toFixed(2)
  }

  function getScenarioEquity(dV, bV) {
    let equity
    dV && bV
      ? (equity = getScenarioAssets(dV) - getScenarioLiability(bV))
      : (equity = 0)
    return equity.toFixed(2)
  }

  function getScenarioAssets(dV) {
    let assets
    depositValues
      ? (assets = dV.reduce(
          (a, v, i) =>
            (a = a + v * ((priceValues[i] * sliderPercentage * 2) / 100)),
          0
        ))
      : (assets = 0)
    return assets.toFixed(2)
  }

  function getScenarioLiability(bV) {
    let liabilities
    borrowValues
      ? (liabilities = bV.reduce((a, v, i) => (a = a + v * priceValues[i]), 0))
      : (liabilities = 0)
    return liabilities.toFixed(2)
  }

  function getScenarioLeverage(dV, bV) {
    let leverage
    dV && bV
      ? (leverage = getScenarioLiability(bV) / getScenarioEquity(dV, bV))
      : (leverage = 0)
    return leverage.toFixed(2)
  }

  function getScenarioCollateralRatio(dV, bV) {
    let collateralRatio
    dV && bV
      ? (collateralRatio =
          (getScenarioAssets(dV) / getScenarioLiability(bV)) * 100)
      : (collateralRatio = 0)

    if (collateralRatio > 999) {
      collateralRatio = 999
    }
    return collateralRatio.toFixed(0)
  }

  function getLiquidationMovePercent(dV, bV) {
    let percentMove
    dV && bV
      ? (percentMove =
          (1 - 100 / (getScenarioCollateralRatio(dV, bV) / 1.1)) * 100)
      : (percentMove = 0)
    if (percentMove <= 0) {
      return 'Account Liquidated'
    }
    return percentMove.toFixed(0) + '%'
  }

  function resetAll() {
    setSliderPercentage(50)
    setDepositsInitialized(false)
    setBorrowsInitialized(false)
    setPricesInitialized(false)
  }

  const onChangeSlider = async (percentage) => {
    setSliderPercentage(percentage)
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row sm:justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Liquidation Calculator
          </h1>
        </div>
        {prices.length > 0 && !loading ? (
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
                      onClick={() => resetAll()}
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
                                  onClick={() => setDepositsInitialized(false)}
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
                                  onClick={() => setBorrowsInitialized(false)}
                                >
                                  Reset
                                </LinkButton>
                              </div>
                            </Th>
                            <Th scope="col" className={`px-3 py-1 font-normal`}>
                              <div className="flex justify-between">
                                Price ($)
                                <LinkButton
                                  onClick={() => setPricesInitialized(false)}
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
                          {Object.entries(symbols).map(([name], i) => (
                            <Tr key={`${i}`}>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <div className="flex items-center">
                                  <img
                                    alt=""
                                    width="20"
                                    height="20"
                                    src={`/assets/icons/${name.toLowerCase()}.svg`}
                                    className={`mr-2.5`}
                                  />
                                  <div>{name}</div>
                                </div>
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={getDeposit(i)}
                                  onChange={(e) =>
                                    setDeposit(e.target.value, i)
                                  }
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={getBorrow(i)}
                                  onChange={(e) => setBorrow(e.target.value, i)}
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={getPrice(i)}
                                  onChange={(e) => setPrice(e.target.value, i)}
                                  disabled={name === 'USDC' ? true : false}
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="text"
                                  value={getCollateralWeight(i)}
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
              <div className="bg-th-bkg-3 col-span-3 p-4 rounded-r-lg">
                <div className="pb-4 text-th-fgd-1 text-lg">
                  Scenario Details
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Equity</div>
                  <div className="font-bold">
                    {`$${getScenarioEquity(depositValues, borrowValues)}`}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Assets Value</div>
                  <div className="font-bold">
                    {`$${getScenarioAssets(depositValues)}`}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Liabilities Value</div>
                  <div className="font-bold">
                    {`$${getScenarioLiability(borrowValues)}`}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Leverage</div>
                  <div className="font-bold">
                    {`${getScenarioLeverage(depositValues, borrowValues)}x`}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Collateral Ratio</div>
                  <div className="font-bold">
                    {`${getScenarioCollateralRatio(
                      depositValues,
                      borrowValues
                    )}%`}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Min. Ratio Required</div>
                  <div className="font-bold">110%</div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Risk</div>
                  {getScenarioCollateralRatio(depositValues, borrowValues) >
                  150 ? (
                    <div className="font-bold text-th-green">Low</div>
                  ) : getScenarioCollateralRatio(depositValues, borrowValues) >
                    125 ? (
                    <div className="font-bold text-th-orange">Moderate</div>
                  ) : (
                    <div className="font-bold text-th-red">High</div>
                  )}
                </div>
                <div className="flex items-center justify-between pb-3">
                  <Tooltip content="The percentage move in total assets value which would result in the liquidation of your account.">
                    <div className="text-th-fgd-3">Price Move To Liquidate</div>
                  </Tooltip>
                  <div className="font-bold">
                    {`${getLiquidationMovePercent(
                      depositValues,
                      borrowValues
                    )}`}
                  </div>
                </div>
              </div>
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
