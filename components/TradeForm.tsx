import React, { useState, useEffect, useRef } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/outline'
import styled from '@emotion/styled'
import useMarket from '../hooks/useMarket'
import useIpAddress from '../hooks/useIpAddress'
import useConnection from '../hooks/useConnection'
import { PublicKey } from '@solana/web3.js'
import { IDS } from '@blockworks-foundation/mango-client'
import { notify } from '../utils/notifications'
import { placeAndSettle } from '../utils/mango'
import { calculateMarketPrice, getDecimalCount } from '../utils'
import FloatingElement from './FloatingElement'
import { floorToDecimal } from '../utils/index'
import useMangoStore from '../stores/useMangoStore'
import Button from './Button'
import TradeType from './TradeType'
import Input from './Input'
import Switch from './Switch'
import LeverageSlider from './LeverageSlider'
import LeverageIndicator from './LeverageIndicator'

const StyledRightInput = styled(Input)`
  border-left: 1px solid transparent;
`

export default function TradeForm() {
  const { baseCurrency, quoteCurrency, market, marketAddress } = useMarket()
  const set = useMangoStore((s) => s.set)
  const connected = useMangoStore((s) => s.wallet.connected)
  const actions = useMangoStore((s) => s.actions)
  const { connection, cluster } = useConnection()
  const { side, baseSize, quoteSize, price, tradeType } = useMangoStore(
    (s) => s.tradeForm
  )
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const prices = useMangoStore((s) => s.selectedMangoGroup.prices) // this one feels a bit wrong

  const collateralRatio = selectedMarginAccount?.getCollateralRatio(
    selectedMangoGroup,
    prices
  )
  const { ipAllowed } = useIpAddress()
  const [invalidInputMessage, setInvalidInputMessage] = useState('')
  const [postOnly, setPostOnly] = useState(false)
  const [ioc, setIoc] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [maxButtonTransition, setMaxButtonTransition] = useState(false)
  const orderBookRef = useRef(useMangoStore.getState().selectedMarket.orderBook)
  const orderbook = orderBookRef.current[0]
  useEffect(
    () =>
      useMangoStore.subscribe(
        (orderBook) => (orderBookRef.current = orderBook as any[]),
        (state) => state.selectedMarket.orderBook
      ),
    []
  )

  useEffect(() => {
    setBaseSize('')
    setInvalidInputMessage('')
    setPrice('')
    setQuoteSize('')
  }, [baseCurrency])

  useEffect(() => {
    if (market && baseSize >= market.minOrderSize) {
      setInvalidInputMessage('')
    }
  }, [baseSize, market])

  // useEffect(() => {
  //   const usePrice = tradeType === 'Limit' ? Number(price) : markPrice
  //   if (baseSize) {
  //     const rawQuoteSize = Number(baseSize) * usePrice
  //     const quoteSize = floorToDecimal(rawQuoteSize, sizeDecimalCount)
  //     setQuoteSize(quoteSize)
  //     debugger;
  //   }
  //   if (quoteSize && usePrice && !baseSize) {
  //     const rawBaseSize = quoteSize / usePrice
  //     const baseSize = floorToDecimal(rawBaseSize, sizeDecimalCount)
  //     setBaseSize(baseSize)
  //     debugger;
  //   }
  // }, [baseSize, markPrice, price, quoteSize, tradeType])

  const [thisAssetBorrow, setThisAssetBorrow] = useState(0)
  const [thisAssetDeposit, setThisAssetDeposit] = useState(0)
  const [usdcBorrow, setUsdcBorrow] = useState(0)
  const [usdcDeposit, setUsdcDeposit] = useState(0)
  const [assetsVal, setAssetsVal] = useState(0) //TODO remove
  const [liabsVal, setLiabsVal] = useState(0) //TODO remove
  const [accountEquity, setAccountEquity] = useState(0) //TODO remove
  const [impliedCollateralRatio, setImpliedCollateralRatio] = useState(0) // TODO remove
  const numericLeverage = 1 / Math.max(0, collateralRatio - 1)
  const long = thisAssetBorrow > thisAssetDeposit ? -1 : 1

  const [leveragePct, setLeveragePct] = useState(0)
  const [targetLiabilities, setTargetLiabilities] = useState(0) // TODO remove
  const [targetNumericLeverage, setTargetNumericLeverage] = useState(0) // TODO remove

  useEffect(() => {
    // TODO below is all for debugging
    if (connected) {
      const AV = selectedMarginAccount?.getAssetsVal(selectedMangoGroup, prices)
      setAssetsVal(AV)
      const LV = selectedMarginAccount?.getLiabsVal(selectedMangoGroup, prices)
      setLiabsVal(LV)
      const TAB = selectedMarginAccount?.getUiBorrow(selectedMangoGroup, 0)
      setThisAssetBorrow(TAB)
      const TAD = selectedMarginAccount?.getUiDeposit(selectedMangoGroup, 0)
      setThisAssetDeposit(TAD)
      const USDCB = selectedMarginAccount?.getUiBorrow(selectedMangoGroup, 4)
      setUsdcBorrow(USDCB)
      const USDCD = selectedMarginAccount?.getUiDeposit(selectedMangoGroup, 4)
      setUsdcDeposit(USDCD)
      const AE = selectedMarginAccount?.computeValue(selectedMangoGroup, prices)
      setAccountEquity(AE)

      debugger
    }
  }, [selectedMarginAccount, selectedMangoGroup, prices, connected])

  useEffect(() => {
    if (connected) {
      const collateralRatio = selectedMarginAccount?.getCollateralRatio(
        selectedMangoGroup,
        prices
      )
      const numericLeverage = 1 / Math.max(0, collateralRatio - 1)
      const updatedLeveragePct = (numericLeverage / 5) * 100

      setLeveragePct(updatedLeveragePct * long)
      debugger
    }
  }, [connected, long])

  const setSide = (side) =>
    set((s) => {
      s.tradeForm.side = side
    })

  const setBaseSize = (baseSize) =>
    set((s) => {
      if (!Number.isNaN(parseFloat(baseSize))) {
        s.tradeForm.baseSize = parseFloat(baseSize)
      } else {
        s.tradeForm.baseSize = baseSize
      }
    })

  const setQuoteSize = (quoteSize) =>
    set((s) => {
      if (!Number.isNaN(parseFloat(quoteSize))) {
        s.tradeForm.quoteSize = parseFloat(quoteSize)
      } else {
        s.tradeForm.quoteSize = quoteSize
      }
    })

  const setPrice = (price) =>
    set((s) => {
      if (!Number.isNaN(parseFloat(price))) {
        s.tradeForm.price = parseFloat(price)
      } else {
        s.tradeForm.price = price
      }
    })

  const setTradeType = (type) =>
    set((s) => {
      s.tradeForm.tradeType = type
    })

  const onChangeSlider = async (leveragePct) => {
    // not yet tested with multiple assets worth of borrows/deposits
    setLeveragePct(leveragePct)
    let setLeverage = false
    let newQuoteSize = 0

    const sliderNumericLeverage = (leveragePct / 100) * 5
    setImpliedCollateralRatio(
      (1 / sliderNumericLeverage) * Math.sign(leveragePct) + 1
    ) // says infinity math.min(100, x)??
    setTargetNumericLeverage(sliderNumericLeverage)
    const targetLiabilities = accountEquity * sliderNumericLeverage
    setTargetLiabilities(targetLiabilities)

    if (tradeType === 'Market') {
      // this part seems oversimplified and probably wont work right if the account has multiple assets' deposits and borows
      if (leveragePct === 0) {
        if (sliderNumericLeverage > numericLeverage * long) {
          // close margin short position
          setSide('buy')
          setQuoteSize(floorToDecimal(thisAssetBorrow, 2))
          onSetBaseSize(thisAssetBorrow)
          debugger
        } else {
          //side == 'sell'    close margin long position
          setSide('sell')
          setQuoteSize(floorToDecimal(usdcBorrow, 2))
          onSetQuoteSize(usdcBorrow)
          debugger
        }
      } else {
        // leveragePct !== 0
        if (sliderNumericLeverage > numericLeverage * long) {
          // side == 'buy'
          setSide('buy')
          let newQuoteSize
          if (long === 1) {
            // already margin long & buying more
            const difference = targetLiabilities - liabsVal + usdcDeposit
            newQuoteSize = difference
          } else {
            // currently margin short
            if (Math.sign(long) === Math.sign(sliderNumericLeverage)) {
              // reducing short position but not crossing 0x leverage
              const difference = liabsVal + targetLiabilities
              newQuoteSize = difference
            } else {
              // crossing 0x leverage, cover all borrows + buy leverage * equity value
              const difference =
                thisAssetBorrow * markPrice +
                accountEquity * sliderNumericLeverage
              newQuoteSize = difference
              debugger
            }
          }
          // setBaseSize(floorToDecimal(newBaseSize, sizeDecimalCount))
          // onSetBaseSize(newBaseSize)
          //lvg goes up if we are opening a borrow, down if we are covering a short -> how do i determine between these 2?
          // newQuoteSize = Math.max((assetsVal - (impliedCollateralRatio * liabsVal))/ (impliedCollateralRatio - 1),0) // this makes sense if the leverage is goin up only
          // if (newQuoteSize > 0) {
          //   setLeverage = true;
          // }

          setQuoteSize(floorToDecimal(newQuoteSize, 2)) // IMO USD values should always display with 2 decimal places, rather than the 4 that sizeDecimalCount gives
          onSetQuoteSize(newQuoteSize)
          debugger
        } else {
          // side == 'sell'
          setSide('sell')
          let newQuoteSize
          if (long === -1) {
            // already short
            const difference = Math.abs(targetLiabilities) - liabsVal
            newQuoteSize = difference
          } else {
            if (Math.sign(long) === Math.sign(sliderNumericLeverage)) {
              // reducing long position but not crossing 0x leverage
              const difference = liabsVal - targetLiabilities
              newQuoteSize = difference
            } else {
              // crossing 0x leverage cover all borrows + buy leverage * equity value
              const difference =
                usdcBorrow + accountEquity * Math.abs(sliderNumericLeverage)
              newQuoteSize = difference
              debugger
            }
          }
          // setBaseSize(floorToDecimal(newBaseSize, sizeDecimalCount))
          // onSetBaseSize(newBaseSize)
          //lvg goes down if we are covering a borrow, up if we are opening a short
          // newQuoteSize = Math.min((assetsVal - (impliedCollateralRatio * liabsVal))/ (impliedCollateralRatio - 1),0) // this makes sense if the leverage is goin down only
          // if (newQuoteSize < 0) {
          //   setLeverage = true;
          // }

          setQuoteSize(floorToDecimal(newQuoteSize, 2))
          onSetQuoteSize(newQuoteSize)
          debugger
        }
      }
    }
  }

  const markPriceRef = useRef(useMangoStore.getState().selectedMarket.markPrice)
  const markPrice = markPriceRef.current
  useEffect(
    () =>
      useMangoStore.subscribe(
        (markPrice) => (markPriceRef.current = markPrice as number),
        (state) => state.selectedMarket.markPrice
      ),
    []
  )

  const sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize)
  // const priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize)

  const onSetPrice = (price: number | '') => {
    setPrice(price)
    if (!price) return
    if (baseSize) {
      onSetBaseSize(baseSize)
    }
  }

  const onSetBaseSize = (baseSize: number | '') => {
    const { price } = useMangoStore.getState().tradeForm
    baseSize
      ? setBaseSize(floorToDecimal(baseSize, sizeDecimalCount))
      : setBaseSize(baseSize)
    if (!baseSize) {
      setQuoteSize('')
      return
    }
    const usePrice = Number(price) || markPrice
    if (!usePrice) {
      setQuoteSize('')
      return
    }
    const rawQuoteSize = baseSize * usePrice
    const quoteSize = baseSize && floorToDecimal(rawQuoteSize, 2)
    setQuoteSize(quoteSize)
    debugger
  }

  const onSetQuoteSize = (quoteSize: number | '') => {
    quoteSize
      ? setQuoteSize(floorToDecimal(quoteSize, 2))
      : setQuoteSize(quoteSize)
    if (!quoteSize) {
      setBaseSize('')
      return
    }

    if (!Number(price) && tradeType === 'Limit') {
      setBaseSize('')
      return
    }
    const usePrice = Number(price) || markPrice
    const rawBaseSize = quoteSize / usePrice
    const baseSize = quoteSize && floorToDecimal(rawBaseSize, sizeDecimalCount)
    setBaseSize(baseSize)
    debugger
  }

  const postOnChange = (checked) => {
    if (checked) {
      setIoc(false)
    }
    setPostOnly(checked)
  }
  const iocOnChange = (checked) => {
    if (checked) {
      setPostOnly(false)
    }
    setIoc(checked)
  }

  async function onSubmit() {
    if (!price && tradeType === 'Limit') {
      console.warn('Missing price')
      notify({
        message: 'Missing price',
        type: 'error',
      })
      return
    } else if (!baseSize) {
      console.warn('Missing size')
      notify({
        message: 'Missing size',
        type: 'error',
      })
      return
    }

    const marginAccount = useMangoStore.getState().selectedMarginAccount.current
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current
    const wallet = useMangoStore.getState().wallet.current

    if (!mangoGroup || !marketAddress || !marginAccount || !market) return
    setSubmitting(true)

    try {
      let calculatedPrice
      if (tradeType === 'Market') {
        calculatedPrice =
          side === 'buy'
            ? calculateMarketPrice(orderbook.asks, baseSize, side)
            : calculateMarketPrice(orderbook.bids, baseSize, side)
      }

      await placeAndSettle(
        connection,
        new PublicKey(IDS[cluster].mango_program_id),
        mangoGroup,
        marginAccount,
        market,
        wallet,
        side,
        calculatedPrice ?? price,
        baseSize,
        ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit'
      )
      debugger
      console.log('Successfully placed trade!')

      setPrice('')
      onSetBaseSize('')
      actions.fetchMarginAccounts()
    } catch (e) {
      notify({
        message: 'Error placing order',
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTradeTypeChange = (tradeType) => {
    setTradeType(tradeType)
    if (tradeType === 'Market') {
      setIoc(true)
      setPrice('')
    } else {
      const limitPrice =
        side === 'buy' ? orderbook.asks[0][0] : orderbook.bids[0][0]
      setPrice(limitPrice)
      setIoc(false)
    }
  }

  const validateInput = () => {
    if (market && baseSize < market.minOrderSize) {
      setInvalidInputMessage(
        `Size must be greater than or equal to ${market.minOrderSize} ${baseCurrency}`
      )
    }
  }

  const disabledTradeButton =
    (!price && tradeType === 'Limit') ||
    !baseSize ||
    (market && baseSize < market.minOrderSize) ||
    !connected ||
    submitting

  return (
    <FloatingElement showConnect>
      <div>
        <div className={`flex mb-4 text-base text-th-fgd-4`}>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 outline-none focus:outline-none`}
          >
            <div
              className={`border-b-2 border-th-bkg-3 hover:text-th-red pb-2 transition-colors duration-500
                ${
                  side === 'sell' &&
                  `text-th-red hover:text-th-red border-b-2 border-th-red`
                }
              `}
            >
              Sell
            </div>
          </button>
          <button
            onClick={() => setSide('buy')}
            className={`flex-1 outline-none focus:outline-none`}
          >
            <div
              className={`border-b-2 border-th-bkg-3 hover:text-th-green pb-2 transition-colors duration-500
                ${
                  side === 'buy' &&
                  `text-th-green hover:text-th-green border-b-2 border-th-green`
                }`}
            >
              Buy
            </div>
          </button>
        </div>
        <Input.Group className="mt-2">
          <Input
            type="number"
            min="0"
            step={market?.tickSize || 1}
            onChange={(e) => onSetPrice(e.target.value)}
            value={price}
            disabled={tradeType === 'Market'}
            prefix={'Price'}
            suffix={quoteCurrency}
            className="rounded-r-none"
            wrapperClassName="w-3/5"
          />
          <TradeType
            onChange={handleTradeTypeChange}
            value={tradeType}
            className="hover:border-th-primary flex-grow"
          />
        </Input.Group>

        <Input.Group className="mt-4">
          <Input
            type="number"
            min="0"
            step={market?.minOrderSize || 1}
            onBlur={() => validateInput()}
            onChange={(e) => onSetBaseSize(e.target.value)}
            value={baseSize}
            className="rounded-r-none"
            wrapperClassName="w-3/5"
            prefix={'Size'}
            suffix={baseCurrency}
          />
          <StyledRightInput
            type="number"
            min="0"
            step={market?.minOrderSize || 1}
            onBlur={() => validateInput()}
            onChange={(e) => onSetQuoteSize(e.target.value)}
            value={quoteSize}
            className="rounded-l-none"
            wrapperClassName="w-2/5"
            suffix={quoteCurrency}
          />
        </Input.Group>
        {invalidInputMessage ? (
          <div className="flex items-center pt-1.5 text-th-red">
            <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
            {invalidInputMessage}
          </div>
        ) : null}
        {tradeType !== 'Market' ? (
          <div className="flex items-center mt-4">
            <Switch checked={postOnly} onChange={postOnChange}>
              POST
            </Switch>
            <div className="ml-4">
              <Switch checked={ioc} onChange={iocOnChange}>
                IOC
              </Switch>
            </div>
            <div className="ml-4 self-right">Leverage Here maybe?</div>
          </div>
        ) : null}
      </div>
      <div>
        <LeverageIndicator leverage={numericLeverage} long={long} />
        <LeverageSlider
          value={leveragePct}
          onChange={(v) => onChangeSlider(v)}
          step={1}
          maxButtonTransition={maxButtonTransition}
        />
      </div>
      <div className={`flex pt-6`}>
        {ipAllowed ? (
          connected ? (
            side === 'buy' ? (
              <Button
                disabled={disabledTradeButton}
                onClick={onSubmit}
                className={`${
                  !disabledTradeButton &&
                  'border-th-green hover:border-th-green-dark'
                } text-th-green hover:text-th-fgd-1 hover:bg-th-green-dark flex-grow`}
              >
                {`${
                  baseSize !== 0 ? 'Buy ' + baseSize : 'Buy'
                } ${baseCurrency}`}
              </Button>
            ) : (
              <Button
                disabled={disabledTradeButton}
                onClick={onSubmit}
                className={`${
                  !disabledTradeButton &&
                  'border-th-red hover:border-th-red-dark'
                } text-th-red hover:text-th-fgd-1 hover:bg-th-red-dark flex-grow`}
              >
                {`${
                  baseSize !== 0 ? 'Sell ' + baseSize : 'Sell'
                } ${baseCurrency}`}
              </Button>
            )
          ) : (
            <Button
              disabled={disabledTradeButton}
              onClick={onSubmit}
              className={`${
                !disabledTradeButton && 'border-th-red hover:border-th-red-dark'
              } text-th-red hover:text-th-fgd-1 hover:bg-th-red-dark flex-grow`}
            >
              {`${
                baseSize > 0
                  ? 'Sell ' + baseSize
                  : 'Set SELL bid >= ' + market?.minOrderSize
              } ${baseCurrency}`}
            </Button>
          )
        ) : (
          <Button disabled className="flex-grow">
            <span className="text-lg font-light">Country Not Allowed</span>
          </Button>
        )}
      </div>
      {/* TOTO remove debug info table*/}
      {connected ? (
        <table>
          <th>Account</th>
          <tr>
            <td>accountEquity</td>
            <td>{accountEquity?.toFixed(2) || 'none'}</td>
            <td>long</td>
            <td>{long.toFixed(0) || 'none'}</td>
          </tr>
          <tr>
            <td>assetsVal</td>
            <td>{assetsVal?.toFixed(2) || 'none'}</td>
            <td>liabsVal</td>
            <td>{liabsVal?.toFixed(2) || 'none'}</td>
          </tr>
          <tr>
            <td>thisAssetBorrow</td>
            <td>{thisAssetBorrow?.toFixed(4) || 'none'}</td>
            <td>thisAssetDeposit</td>
            <td>{thisAssetDeposit?.toFixed(4) || 'none'}</td>
          </tr>
          <tr>
            <td>usdcBorrow</td>
            <td>{usdcBorrow?.toFixed(2) || 'none'}</td>
            <td>usdcDeposit</td>
            <td>{usdcDeposit?.toFixed(2) || 'none'}</td>
          </tr>
          <tr>
            <td>numericLeverage</td>
            <td>{numericLeverage?.toFixed(2) || 'none'}</td>
            <td>collateralRatio</td>
            <td>{collateralRatio?.toFixed(2) || 'none'}</td>
          </tr>
          <th>Trade Form</th>
          <tr>
            <td>side</td>
            <td>{side || 'none'}</td>
          </tr>
          <tr>
            <td>leveragePct</td>
            <td>{leveragePct.toFixed(2) || 'none'}</td>
            <td>targetNumericLeverage</td>
            <td>{targetNumericLeverage.toFixed(2) || 'none'}</td>
          </tr>
          <tr>
            <td>targetLiabilities</td>
            <td>{targetLiabilities.toFixed(2) || 'none'}</td>
            <td>impliedCollateralRatio</td>
            <td>{impliedCollateralRatio.toFixed(2) || 'none'}</td>
          </tr>
        </table>
      ) : null}
    </FloatingElement>
  )
}
