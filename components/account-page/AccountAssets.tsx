import { useCallback, useState } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../../stores/useMangoStore'
import { useBalances } from '../../hooks/useBalances'
import { tokenPrecision } from '../../utils/index'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import Button from '../Button'

export default function AccountAssets() {
  const balances = useBalances()
  console.log(balances)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)

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

  return selectedMarginAccount ? (
    <>
      <div className="sm:flex sm:items-center sm:justify-between pb-4">
        <div className="pb-2 sm:pb-0 text-th-fgd-1 text-lg">Your Assets</div>
        {balances.length > 0 ? (
          <div className="border border-th-green flex items-center justify-between p-2 rounded">
            <div className="pr-4 text-xs text-th-fgd-3">Total Asset Value:</div>
            <span>
              $
              {balances
                .reduce(
                  (acc, d, i) =>
                    acc +
                    (d.marginDeposits + d.orders + d.unsettled) * prices[i],
                  0
                )
                .toFixed(2)}
            </span>
          </div>
        ) : null}
      </div>
      {selectedMangoGroup && balances.length > 0 ? (
        <Table className="min-w-full divide-y divide-th-bkg-2">
          <Thead>
            <Tr className="text-th-fgd-3 text-xs">
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Asset
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Available
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                In Orders
              </Th>
              <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                Unsettled
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
            {balances.map((bal, i) => (
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
                      src={`/assets/icons/${bal.coin.toLowerCase()}.svg`}
                      className={`mr-2.5`}
                    />
                    <div>{bal.coin}</div>
                  </div>
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  {bal.marginDeposits.toFixed(tokenPrecision[bal.coin])}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  {bal.orders.toFixed(tokenPrecision[bal.coin])}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  {bal.unsettled.toFixed(tokenPrecision[bal.coin])}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  $
                  {(
                    (bal.marginDeposits + bal.orders + bal.unsettled) *
                    prices[i]
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
                      onClick={() => handleShowDeposit(bal.coin)}
                      className="text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                      disabled={!connected || loadingMarginAccount}
                    >
                      <span>Deposit</span>
                    </Button>
                    <Button
                      onClick={() => handleShowWithdraw(bal.coin)}
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
      ) : (
        <div
          className={`w-full text-center py-6 bg-th-bkg-1 text-th-fgd-3 rounded-md`}
        >
          No assets found.
        </div>
      )}
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
