import useConnection from '../hooks/useConnection'
import useMangoStore from '../stores/useMangoStore'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

export default function LeverageSlider(props) {
  const { connection } = useConnection()
  const marks = { 1: '1x', 2: '2x', 3: '3x', 4: '4x', 5: '5x' }
  const symbolToIndex = { BTC: 0, ETH: 1, USDT: 2 }

  const setQuoteSize = async (leverage: number) => {
    const selectedMarginAccount = useMangoStore.getState().selectedMarginAccount
      .current
    const selectedMangoGroup = useMangoStore.getState().selectedMangoGroup
      .current
    const prices = await selectedMangoGroup.getPrices(connection)
    const accountEquity = selectedMarginAccount.computeValue(
      selectedMangoGroup,
      prices
    )
    const accountBorrows = selectedMarginAccount.getLiabsVal(
      selectedMangoGroup,
      prices
    )

    // Current deposit value of the token we may need to borrow.
    // If we are buying, this will be value of our current quoteCurrency deposits,
    // Otherwise it will be the deposit value of the baseCurrency
    // Currently, USDT is the only quoteCurrency offered, while baseCurrency may be either BTC or ETH.
    const depositVal =
      props.side == 'buy'
        ? selectedMarginAccount.getUiDeposit(
            selectedMangoGroup,
            symbolToIndex[props.quoteCurrency]
          )
        : selectedMarginAccount.getUiDeposit(
            selectedMangoGroup,
            symbolToIndex[props.baseCurrency]
          )

    const selectedPosition =
      leverage * accountEquity + depositVal - accountBorrows

    if (selectedPosition > 0) props.onSetQuoteSize(selectedPosition.toFixed(2))
  }

  return (
    <>
      <br />
      <Slider
        onChange={(v) => setQuoteSize(v)}
        min={1}
        max={5}
        included={true}
        step={0.01}
        marks={marks}
      />
      <br />
    </>
  )
}
