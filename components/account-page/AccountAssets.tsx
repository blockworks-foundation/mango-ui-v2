import { useCallback, useState } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../../stores/useMangoStore'
import { useOpenOrders } from '../../hooks/useOpenOrders'
import { floorToDecimal, tokenPrecision } from '../../utils/index'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import Button from '../Button'

export default function AccountAssets({ symbols }) {
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const openOrders = useOpenOrders()
  const connected = useMangoStore((s) => s.wallet.connected)

  console.log(openOrders)

  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawSymbol, setWithdrawSymbol] = useState('')
  const [depositSymbol, setDepositSymbol] = useState('')

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
  }, [])

  const handleCloseWithdraw = useCallback(() => {
    setShowWithdrawModal(false)
  }, [])

  const handleShowWithdraw = (symbol) => {
    setWithdrawSymbol(symbol)
    setShowWithdrawModal(true)
  }

  const handleShowDeposit = (symbol) => {
    setDepositSymbol(symbol)
    setShowDepositModal(true)
  }

  const getAccountValue = () =>
    Object.entries(symbols)
      .map(
        ([name], i) =>
          floorToDecimal(
            selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
            tokenPrecision[name]
          ) * prices[i]
      )
      .reduce((a, b) => a + b, 0)
      .toFixed(2)

  // const getBalanceInOrders = (symbol) => {
  //   for (let i = 0; i < openOrders.length; i++) {
  //     if (openOrders[i].marketName.includes(symbol)) {
  //       return openOrders[i].side === 'sell'
  //         ? openOrders[i].size
  //         : openOrders[i].size * openOrders[i].price
  //     } else return 0
  //   }
  // }

  return selectedMarginAccount ? (
    <>
      <div className="flex items-center justify-between pb-4">
        <div className="text-th-fgd-1 text-lg">Your Assets</div>
        <div className="border border-th-green flex items-center justify-between p-2 rounded">
          <div className="pr-4 text-xs text-th-fgd-3">Total Asset Value:</div>
          <span>${getAccountValue()}</span>
        </div>
      </div>
      {selectedMangoGroup && selectedMarginAccount ? (
        <Table className="min-w-full divide-y divide-th-bkg-2">
          <Thead>
            <Tr className="text-th-fgd-3 text-xs">
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Asset
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Balance
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                In Orders
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Value
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Interest APR
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(symbols).map(([name], i) => (
              <Tr
                key={`${i}`}
                className={`border-b border-th-bkg-3
                  ${i % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                `}
              >
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
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
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  {selectedMarginAccount
                    .getUiDeposit(selectedMangoGroup, i)
                    .toFixed(tokenPrecision[name])}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  0
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  $
                  {(
                    floorToDecimal(
                      selectedMarginAccount.getUiDeposit(selectedMangoGroup, i),
                      tokenPrecision[name]
                    ) * prices[i]
                  ).toFixed(2)}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  <span className={`text-th-green`}>
                    {(selectedMangoGroup.getDepositRate(i) * 100).toFixed(2)}%
                  </span>
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  <div className={`flex justify-end`}>
                    <Button
                      onClick={() => handleShowDeposit(name)}
                      className="text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                      disabled={!connected || loadingMarginAccount}
                    >
                      <span>Deposit</span>
                    </Button>
                    <Button
                      onClick={() => handleShowWithdraw(name)}
                      className="ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                      disabled={!connected || loadingMarginAccount}
                    >
                      <span>Withdraw</span>
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}
      {showDepositModal && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={handleCloseDeposit}
          tokenSymbol={depositSymbol}
        />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={handleCloseWithdraw}
          tokenSymbol={withdrawSymbol}
        />
      )}
    </>
  ) : null
}
