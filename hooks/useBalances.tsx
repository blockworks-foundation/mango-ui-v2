import { Balances } from '../@types/types'
import { nativeToUi } from '@blockworks-foundation/mango-client'
import useMarketList from './useMarketList'
import useMangoStore from '../stores/useMangoStore'
import {
  displayBorrowsForMarginAccount,
  displayDepositsForMarginAccount,
  floorToDecimal,
} from '../utils'
import useAllMarkets from './useAllMarkets'
import { sumBy } from 'lodash'

export function useBalances(): Balances[] {
  const balances = []
  const markets = useAllMarkets()
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const marginAccount = useMangoStore((s) => s.selectedMarginAccount.current)
  const { symbols } = useMarketList()

  for (const { market, baseCurrency, quoteCurrency } of markets) {
    if (!marginAccount || !mangoGroup || !market) {
      return []
    }

    const marketIndex = mangoGroup.getMarketIndex(market)
    const openOrders: any = marginAccount.openOrdersAccounts[marketIndex]
    const baseCurrencyIndex = Object.entries(symbols).findIndex(
      (x) => x[0] === baseCurrency
    )
    const quoteCurrencyIndex = Object.entries(symbols).findIndex(
      (x) => x[0] === quoteCurrency
    )

    if (
      baseCurrency === 'UNKNOWN' ||
      quoteCurrency === 'UNKNOWN' ||
      !baseCurrency ||
      !quoteCurrency
    ) {
      return []
    }

    let nativeBaseFree = 0
    let nativeQuoteFree = 0
    let nativeBaseLocked = 0
    let nativeQuoteLocked = 0
    if (openOrders) {
      nativeBaseFree = openOrders.baseTokenFree.toNumber()
      nativeQuoteFree = openOrders.quoteTokenFree
        .add(openOrders['referrerRebatesAccrued'])
        .toNumber()
      nativeBaseLocked = openOrders.baseTokenTotal
        .sub(openOrders.baseTokenFree)
        .toNumber()
      nativeQuoteLocked = openOrders.quoteTokenTotal
        .sub(openOrders.quoteTokenFree)
        .toNumber()
    }

    const net = (locked, currencyIndex) => {
      const amount =
        marginAccount.getNativeDeposit(mangoGroup, currencyIndex) +
        locked -
        marginAccount.getNativeBorrow(mangoGroup, currencyIndex)

      return floorToDecimal(
        nativeToUi(amount, mangoGroup.mintDecimals[currencyIndex]),
        mangoGroup.mintDecimals[currencyIndex]
      )
    }

    const marketPair = [
      {
        market,
        key: `${baseCurrency}${quoteCurrency}${baseCurrency}`,
        coin: baseCurrency,
        marginDeposits: displayDepositsForMarginAccount(
          marginAccount,
          mangoGroup,
          baseCurrencyIndex
        ),
        borrows: displayBorrowsForMarginAccount(
          marginAccount,
          mangoGroup,
          baseCurrencyIndex
        ),
        orders: nativeToUi(
          nativeBaseLocked,
          mangoGroup.mintDecimals[marketIndex]
        ),
        unsettled: nativeToUi(
          nativeBaseFree,
          mangoGroup.mintDecimals[marketIndex]
        ),
        net: net(nativeBaseLocked, marketIndex),
      },
      {
        market,
        key: `${quoteCurrency}${baseCurrency}${quoteCurrency}`,
        coin: quoteCurrency,
        marginDeposits: displayDepositsForMarginAccount(
          marginAccount,
          mangoGroup,
          quoteCurrencyIndex
        ),
        borrows: displayBorrowsForMarginAccount(
          marginAccount,
          mangoGroup,
          quoteCurrencyIndex
        ),
        orders: nativeToUi(
          nativeQuoteLocked,
          mangoGroup.mintDecimals[quoteCurrencyIndex]
        ),
        unsettled: nativeToUi(
          nativeQuoteFree,
          mangoGroup.mintDecimals[quoteCurrencyIndex]
        ),
        net: net(nativeQuoteLocked, quoteCurrencyIndex),
      },
    ]
    balances.push(marketPair)
  }

  const baseBalances = balances.map((b) => b[0])
  const quoteBalances = balances.map((b) => b[1])
  const quoteMeta = quoteBalances[0]
  const quoteInOrders = sumBy(quoteBalances, 'orders')
  const unsettled = sumBy(quoteBalances, 'unsettled')
  const net =
    quoteMeta.marginDeposits + unsettled - quoteMeta.borrows - quoteInOrders
  const quoteCurrencyIndex = Object.entries(symbols).findIndex(
    (x) => x[0] === quoteMeta.coin
  )

  return baseBalances.concat([
    {
      market: null,
      key: `${quoteMeta.coin}${quoteMeta.coin}`,
      coin: quoteMeta.coin,
      marginDeposits: quoteMeta.marginDeposits,
      borrows: quoteMeta.borrows,
      orders: quoteInOrders,
      unsettled,
      net: floorToDecimal(net, mangoGroup.mintDecimals[quoteCurrencyIndex]),
    },
  ])
}
