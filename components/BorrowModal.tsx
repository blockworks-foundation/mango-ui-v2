import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import Input from './Input'
import { ElementTitle } from './styles'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import {
  DECIMALS,
  floorToDecimal,
  tokenPrecision,
  displayDepositsForMarginAccount,
} from '../utils/index'
import useConnection from '../hooks/useConnection'
import { borrowAndWithdraw } from '../utils/mango'
import Loading from './Loading'
import Slider from './Slider'
import Button, { LinkButton } from './Button'
import { notify } from '../utils/notifications'
import Tooltip from './Tooltip'
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import { PublicKey } from '@solana/web3.js'
import { MarginAccount, uiToNative } from '@blockworks-foundation/mango-client'
import Select from './Select'

interface BorrowModalProps {
  onClose: () => void
  isOpen: boolean
  tokenSymbol?: string
}

const BorrowModal: FunctionComponent<BorrowModalProps> = ({
  isOpen,
  onClose,
  tokenSymbol = '',
}) => {
  const [borrowTokenSymbol, setBorrowTokenSymbol] = useState(
    tokenSymbol || 'USDC'
  )
  const [borrowAssetDetails, setBorrowAssetDetails] = useState(null)
  const [inputAmount, setInputAmount] = useState(0)
  const [invalidAmountMessage, setInvalidAmountMessage] = useState('')
  const [maxAmount, setMaxAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [simulation, setSimulation] = useState(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const [sliderPercentage, setSliderPercentage] = useState(0)
  const [maxButtonTransition, setMaxButtonTransition] = useState(false)
  const { getTokenIndex, symbols } = useMarketList()
  const { connection, programId } = useConnection()
  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const actions = useMangoStore((s) => s.actions)
  const tokenIndex = useMemo(
    () => getTokenIndex(symbols[borrowTokenSymbol]),
    [borrowTokenSymbol, getTokenIndex]
  )

  useEffect(() => {
    if (!selectedMangoGroup || !selectedMarginAccount || !borrowTokenSymbol)
      return

    const mintDecimals = selectedMangoGroup.mintDecimals[tokenIndex]
    const groupIndex = selectedMangoGroup.indexes[tokenIndex]
    const deposits = selectedMarginAccount.getUiDeposit(
      selectedMangoGroup,
      tokenIndex
    )
    const borrows = selectedMarginAccount.getUiBorrow(
      selectedMangoGroup,
      tokenIndex
    )

    const currentAssetsVal =
      selectedMarginAccount.getAssetsVal(selectedMangoGroup, prices) -
      getMaxForSelectedAsset() * prices[tokenIndex]
    const currentLiabs = selectedMarginAccount.getLiabsVal(
      selectedMangoGroup,
      prices
    )
    // multiply by 0.99 and subtract 0.01 to account for rounding issues
    const liabsAvail = (currentAssetsVal / 1.2 - currentLiabs) * 0.99 - 0.01

    // calculate max withdraw amount
    const amountToWithdraw =
      liabsAvail / prices[tokenIndex] + getMaxForSelectedAsset()

    if (amountToWithdraw > 0) {
      setMaxAmount(amountToWithdraw)
    } else {
      setMaxAmount(0)
    }

    // simulate change to deposits & borrow based on input amount
    const newDeposit = Math.max(0, deposits - inputAmount)
    const newBorrows = borrows + Math.max(0, inputAmount - deposits)

    // clone MarginAccount and arrays to not modify selectedMarginAccount
    const simulation = new MarginAccount(null, selectedMarginAccount)
    simulation.deposits = [...selectedMarginAccount.deposits]
    simulation.borrows = [...selectedMarginAccount.borrows]

    // update with simulated values
    simulation.deposits[tokenIndex] =
      uiToNative(newDeposit, mintDecimals).toNumber() / groupIndex.deposit
    simulation.borrows[tokenIndex] =
      uiToNative(newBorrows, mintDecimals).toNumber() / groupIndex.borrow

    const equity = simulation.computeValue(selectedMangoGroup, prices)
    const assetsVal = simulation.getAssetsVal(selectedMangoGroup, prices)
    const liabsVal = simulation.getLiabsVal(selectedMangoGroup, prices)
    const collateralRatio = simulation.getCollateralRatio(
      selectedMangoGroup,
      prices
    )
    const leverage = 1 / Math.max(0, collateralRatio - 1)

    setSimulation({
      equity,
      assetsVal,
      liabsVal,
      collateralRatio,
      leverage,
    })
  }, [
    inputAmount,
    prices,
    tokenIndex,
    selectedMarginAccount,
    selectedMangoGroup,
  ])

  const handleWithdraw = () => {
    setSubmitting(true)
    const marginAccount = useMangoStore.getState().selectedMarginAccount.current
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current
    const wallet = useMangoStore.getState().wallet.current as any
    if (!marginAccount || !mangoGroup) return

    borrowAndWithdraw(
      connection,
      new PublicKey(programId),
      mangoGroup,
      marginAccount,
      wallet,
      new PublicKey(symbols[borrowTokenSymbol]),
      Number(inputAmount)
    )
      .then((_transSig: string) => {
        setSubmitting(false)
        actions.fetchMangoGroup()
        actions.fetchMarginAccounts()
        actions.fetchWalletBalances()
        onClose()
      })
      .catch((err) => {
        setSubmitting(false)
        console.warn('Error borrowing and withdrawing:', err)
        notify({
          message: 'Could not perform borrow and withdraw',
          description: `${err}`,
          txid: err.txid,
          type: 'error',
        })
        onClose()
      })
  }

  const handleSetSelectedAsset = (symbol) => {
    setInputAmount(0)
    setSliderPercentage(0)
    setBorrowTokenSymbol(symbol)
  }

  const getMaxForSelectedAsset = () => {
    return displayDepositsForMarginAccount(
      selectedMarginAccount,
      selectedMangoGroup,
      tokenIndex
    )
  }

  const getBorrowAmount = () => {
    const tokenBalance = getMaxForSelectedAsset()
    const borrowAmount = inputAmount - tokenBalance
    return borrowAmount > 0 ? borrowAmount : 0
  }

  const getAccountStatusColor = (
    collateralRatio: number,
    isRisk?: boolean,
    isStatus?: boolean
  ) => {
    if (collateralRatio < 1.25) {
      return isRisk ? (
        <div className="text-th-red">High</div>
      ) : isStatus ? (
        'bg-th-red'
      ) : (
        'border-th-red text-th-red'
      )
    } else if (collateralRatio > 1.25 && collateralRatio < 1.5) {
      return isRisk ? (
        <div className="text-th-orange">Moderate</div>
      ) : isStatus ? (
        'bg-th-orange'
      ) : (
        'border-th-orange text-th-orange'
      )
    } else {
      return isRisk ? (
        <div className="text-th-green">Low</div>
      ) : isStatus ? (
        'bg-th-green'
      ) : (
        'border-th-green text-th-green'
      )
    }
  }

  const setMaxBorrowForSelectedAsset = async () => {
    setInputAmount(trimDecimals(maxAmount, DECIMALS[borrowTokenSymbol]))
    setSliderPercentage(100)
    setInvalidAmountMessage('')
    setMaxButtonTransition(true)
  }

  const onChangeAmountInput = (amount) => {
    setInputAmount(amount)
    setSliderPercentage((amount / maxAmount) * 100)
    setInvalidAmountMessage('')
  }

  const onChangeSlider = async (percentage) => {
    const amount = (percentage / 100) * maxAmount
    setInputAmount(trimDecimals(amount, DECIMALS[borrowTokenSymbol]))
    setSliderPercentage(percentage)
    setInvalidAmountMessage('')
  }

  const validateAmountInput = (e) => {
    const amount = e.target.value
    if (Number(amount) <= 0) {
      setInvalidAmountMessage('Withdrawal amount must be greater than 0')
    }
    if (simulation.collateralRatio < 1.2) {
      setInvalidAmountMessage(
        'Leverage too high. Reduce the amount to withdraw'
      )
    }
  }

  const trimDecimals = (n, digits) => {
    const step = Math.pow(10, digits || 0)
    const temp = Math.trunc(step * n)

    return temp / step
  }

  const getTokenBalances = () =>
    Object.entries(symbols).map(([name], i) => {
      return {
        symbol: name,
        balance: floorToDecimal(
          selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
          tokenPrecision[name]
        ),
      }
    })

  // turn off slider transition for dragging slider handle interaction
  useEffect(() => {
    if (maxButtonTransition) {
      setMaxButtonTransition(false)
    }
  }, [maxButtonTransition])

  useEffect(() => {
    const assetIndex = Object.keys(symbols).findIndex(
      (a) => a === borrowTokenSymbol
    )
    const totalDeposits = selectedMangoGroup.getUiTotalDeposit(assetIndex)
    const totalBorrows = selectedMangoGroup.getUiTotalBorrow(assetIndex)

    setBorrowAssetDetails({
      interest: selectedMangoGroup.getBorrowRate(assetIndex) * 100,
      price: prices[assetIndex],
      totalDeposits,
      totalBorrows,
      utilization: totalDeposits > 0.0 ? totalBorrows / totalDeposits : 0.0,
    })
  }, [borrowTokenSymbol])

  if (!borrowTokenSymbol) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        {!showSimulation ? (
          <>
            <Modal.Header>
              <ElementTitle noMarignBottom>Borrow Funds</ElementTitle>
            </Modal.Header>
            <div className="pb-2 text-th-fgd-1">Asset</div>
            <Select
              value={
                borrowTokenSymbol && selectedMarginAccount ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <img
                        alt=""
                        width="20"
                        height="20"
                        src={`/assets/icons/${borrowTokenSymbol.toLowerCase()}.svg`}
                        className={`mr-2.5`}
                      />
                      {borrowTokenSymbol}
                    </div>
                    {floorToDecimal(
                      selectedMarginAccount.getUiDeposit(
                        selectedMangoGroup,
                        tokenIndex
                      ),
                      tokenPrecision[borrowTokenSymbol]
                    )}
                  </div>
                ) : (
                  <span className="text-th-fgd-4">Select an asset</span>
                )
              }
              onChange={(asset) => handleSetSelectedAsset(asset)}
            >
              {getTokenBalances().map(({ symbol, balance }) => (
                <Select.Option key={symbol} value={symbol}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        alt=""
                        width="20"
                        height="20"
                        src={`/assets/icons/${symbol.toLowerCase()}.svg`}
                        className={`mr-2.5`}
                      />
                      <span>{symbol}</span>
                    </div>
                    {balance}
                  </div>
                </Select.Option>
              ))}
            </Select>
            <div className="flex justify-between pb-2 pt-4">
              <div className="text-th-fgd-1">Amount</div>
              <div className="flex space-x-4">
                <div
                  className="text-th-fgd-1 underline cursor-pointer default-transition hover:text-th-primary hover:no-underline"
                  onClick={setMaxBorrowForSelectedAsset}
                >
                  Max
                </div>
              </div>
            </div>
            <div className="flex">
              <Input
                disabled={!borrowTokenSymbol}
                type="number"
                min="0"
                className={`border border-th-fgd-4 flex-grow pr-11`}
                error={!!invalidAmountMessage}
                placeholder="0.00"
                value={inputAmount}
                onBlur={validateAmountInput}
                onChange={(e) => onChangeAmountInput(e.target.value)}
                suffix={borrowTokenSymbol}
              />
              {simulation ? (
                <Tooltip content="Projected Leverage" className="py-1">
                  <span
                    className={`${getAccountStatusColor(
                      simulation.collateralRatio
                    )} bg-th-bkg-1 border flex font-semibold h-10 items-center justify-center ml-2 rounded text-th-fgd-1 w-14`}
                  >
                    {simulation.leverage < 5
                      ? simulation.leverage.toFixed(2)
                      : '>5'}
                    x
                  </span>
                </Tooltip>
              ) : null}
            </div>
            {invalidAmountMessage ? (
              <div className="flex items-center pt-1.5 text-th-red">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                {invalidAmountMessage}
              </div>
            ) : null}
            <div className="pt-3 pb-4">
              <Slider
                disabled={!borrowTokenSymbol}
                value={sliderPercentage}
                onChange={(v) => onChangeSlider(v)}
                step={1}
                maxButtonTransition={maxButtonTransition}
              />
            </div>
            <div className={`pt-8 flex justify-center`}>
              <Button
                onClick={() => setShowSimulation(true)}
                disabled={
                  Number(inputAmount) <= 0 || simulation?.collateralRatio < 1.2
                }
                className="w-full"
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
        {showSimulation && simulation ? (
          <>
            <Modal.Header>
              <ElementTitle noMarignBottom>Confirm Borrow</ElementTitle>
            </Modal.Header>
            {simulation.collateralRatio < 1.2 ? (
              <div className="border border-th-red mb-4 p-2 rounded">
                <div className="flex items-center text-th-fgd-1">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1.5 flex-shrink-0 text-th-red" />
                  Prices have changed and increased your leverage. Reduce the
                  borrow amount.
                </div>
              </div>
            ) : null}
            <div className="bg-th-bkg-1 p-4 rounded-lg text-th-fgd-1 text-center">
              <div className="text-th-fgd-3 pb-1">
                You&apos;re about to withdraw
              </div>
              <div className="flex items-center justify-center">
                <div className="font-semibold relative text-xl">
                  {inputAmount}
                  <span className="absolute bottom-0.5 font-normal ml-1.5 text-xs text-th-fgd-4">
                    {borrowTokenSymbol}
                  </span>
                </div>
              </div>
            </div>
            {getBorrowAmount() > 0 ? (
              <div className="bg-th-bkg-1 mt-2 p-4 rounded-lg text-th-fgd-1 text-center">
                <div className="flex justify-between pb-2">
                  <div className="text-th-fgd-4">Borrow Amount</div>
                  <div className="text-th-fgd-1">
                    {trimDecimals(
                      getBorrowAmount(),
                      DECIMALS[borrowTokenSymbol]
                    )}{' '}
                    {borrowTokenSymbol}
                  </div>
                </div>
                <div className="flex justify-between pb-2">
                  <div className="text-th-fgd-4">Interest APR</div>
                  <div className="text-th-fgd-1">
                    {borrowAssetDetails.interest.toFixed(2)}%
                  </div>
                </div>
                <div className="flex justify-between pb-2">
                  <div className="text-th-fgd-4">Price</div>
                  <div className="text-th-fgd-1">
                    ${borrowAssetDetails.price}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-th-fgd-4">Available Liquidity</div>
                  <div className="text-th-fgd-1">
                    {(
                      borrowAssetDetails.totalDeposits -
                      borrowAssetDetails.totalBorrows
                    ).toFixed(DECIMALS[borrowTokenSymbol])}{' '}
                    {borrowTokenSymbol}
                  </div>
                </div>
              </div>
            ) : null}
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={`border border-th-fgd-4 default-transition font-normal mt-4 pl-3 pr-2 py-2.5 ${
                      open ? 'rounded-b-none' : 'rounded-md'
                    } text-th-fgd-1 w-full hover:bg-th-bkg-3 focus:outline-none`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex h-2 w-2 mr-2.5 relative">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getAccountStatusColor(
                              simulation.collateralRatio,
                              false,
                              true
                            )} opacity-75`}
                          ></span>
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${getAccountStatusColor(
                              simulation.collateralRatio,
                              false,
                              true
                            )}`}
                          ></span>
                        </span>
                        Account Health Check
                        <Tooltip content="The details of your account after this withdrawal.">
                          <InformationCircleIcon
                            className={`h-5 w-5 ml-2 text-th-fgd-3 cursor-help`}
                          />
                        </Tooltip>
                      </div>
                      {open ? (
                        <ChevronUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 mr-1" />
                      )}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel
                    className={`border border-th-fgd-4 border-t-0 p-4 rounded-b-md`}
                  >
                    <div>
                      <div className="flex justify-between pb-2">
                        <div className="text-th-fgd-4">Account Value</div>
                        <div className="text-th-fgd-1">
                          ${simulation.assetsVal.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between pb-2">
                        <div className="text-th-fgd-4">Account Risk</div>
                        <div className="text-th-fgd-1">
                          {getAccountStatusColor(
                            simulation.collateralRatio,
                            true
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pb-2">
                        <div className="text-th-fgd-4">Leverage</div>
                        <div className="text-th-fgd-1">
                          {simulation.leverage.toFixed(2)}x
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-th-fgd-4">Collateral Ratio</div>
                        <div className="text-th-fgd-1">
                          {simulation.collateralRatio * 100 < 200
                            ? Math.floor(simulation.collateralRatio * 100)
                            : '>200'}
                          %
                        </div>
                      </div>
                      {simulation.liabsVal > 0.05 ? (
                        <div className="flex justify-between pt-2">
                          <div className="text-th-fgd-4">Borrow Value</div>
                          <div className="text-th-fgd-1">
                            ${simulation.liabsVal.toFixed(2)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
            <div className={`mt-5 flex justify-center`}>
              <Button
                onClick={handleWithdraw}
                disabled={
                  Number(inputAmount) <= 0 || simulation.collateralRatio < 1.2
                }
                className="w-full"
              >
                <div className={`flex items-center justify-center`}>
                  {submitting && <Loading className="-ml-1 mr-3" />}
                  Confirm
                </div>
              </Button>
            </div>
            <LinkButton
              className="flex items-center mt-4 text-th-fgd-3"
              onClick={() => setShowSimulation(false)}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back
            </LinkButton>
          </>
        ) : null}
      </>
    </Modal>
  )
}

export default React.memo(BorrowModal)
