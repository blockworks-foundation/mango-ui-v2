import { useCallback, useState } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { ScaleIcon } from '@heroicons/react/outline'
import useMangoStore from '../../stores/useMangoStore'
import useMarketList from '../../hooks/useMarketList'
import { floorToDecimal, tokenPrecision } from '../../utils/index'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import Button from '../Button'

export default function AccountAssets() {
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)
  const { symbols } = useMarketList()

  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
  }, [])

  const handleCloseWithdraw = useCallback(() => {
    setShowWithdrawModal(false)
  }, [])

  const getAccountBorrowValue = () =>
    Object.entries(symbols)
      .map(
        ([name], i) =>
          floorToDecimal(
            selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
            tokenPrecision[name]
          ) * prices[i]
      )
      .reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div className="text-th-fgd-1 text-lg">Your Borrows</div>
        <div className="bg-th-bkg-3 flex items-center justify-between p-2 rounded">
          <div className="pr-4 text-xs text-th-fgd-3">Total Borrow Value:</div>
          <span>${getAccountBorrowValue()}</span>
        </div>
      </div>
      {selectedMangoGroup ? (
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
                Value
              </Th>
              <Th scope="col" className="px-6 py-3 text-left font-normal">
                Interest APY
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
                    ? selectedMarginAccount
                        .getUiBorrow(selectedMangoGroup, i)
                        .toFixed(tokenPrecision[name])
                    : (0).toFixed(tokenPrecision[name])}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  $
                  {selectedMarginAccount
                    ? (
                        selectedMarginAccount.getUiBorrow(
                          selectedMangoGroup,
                          i
                        ) * prices[i]
                      ).toFixed(2)
                    : 0}
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  <span className={`text-th-green`}>
                    {(selectedMangoGroup.getBorrowRate(i) * 100).toFixed(2)}%
                  </span>
                </Td>
                <Td
                  className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                >
                  <div className={`flex justify-end`}>
                    <Button
                      onClick={() => setShowWithdrawModal(true)}
                      className="text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                      disabled={!connected || loadingMarginAccount}
                    >
                      <span>Borrow</span>
                    </Button>
                    {selectedMarginAccount.getUiBorrow(selectedMangoGroup, i) >
                    0 ? (
                      <Button
                        onClick={() => setShowWithdrawModal(true)}
                        className="ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                        disabled={
                          !connected ||
                          !selectedMarginAccount ||
                          loadingMarginAccount
                        }
                      >
                        <span>Settle</span>
                      </Button>
                    ) : null}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}
      {showDepositModal && (
        <DepositModal isOpen={showDepositModal} onClose={handleCloseDeposit} />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={handleCloseWithdraw}
        />
      )}
    </>
  )
}
