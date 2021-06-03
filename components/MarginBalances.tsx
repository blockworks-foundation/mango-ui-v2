import { useCallback, useState } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon, CurrencyDollarIcon } from '@heroicons/react/outline'
import FloatingElement from './FloatingElement'
import { ElementTitle } from './styles'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import {
  abbreviateAddress,
  floorToDecimal,
  tokenPrecision,
} from '../utils/index'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import BorrowModal from './BorrowModal'
import Button from './Button'
import Tooltip from './Tooltip'
import AccountsModal from './AccountsModal'
import { MarginAccount } from '@blockworks-foundation/mango-client'

export default function MarginBalances() {
  const setMangoStore = useMangoStore((s) => s.set)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)
  const { symbols } = useMarketList()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
  }, [])

  const handleCloseWithdraw = useCallback(() => {
    setShowWithdrawModal(false)
  }, [])

  const handleCloseBorrow = useCallback(() => {
    setShowBorrowModal(false)
  }, [])

  const handleCloseAccounts = useCallback(() => {
    setShowAccountsModal(false)
  }, [])

  return (
    <>
      <FloatingElement>
        <div className="flex justify-between pb-3">
          <div className="w-8 h-8" />
          <div className="flex flex-col items-center">
            <ElementTitle noMarignBottom>Margin Account</ElementTitle>
            {selectedMarginAccount ? (
              <Link href={'/account'}>
                <a className="pt-1 text-th-fgd-3 text-xs underline hover:no-underline">
                  {abbreviateAddress(selectedMarginAccount?.publicKey)}
                </a>
              </Link>
            ) : null}
          </div>
          <div className="flex relative">
            <Tooltip content={'Accounts'} className="text-xs py-1">
              <button
                disabled={!connected}
                onClick={() => setShowAccountsModal(true)}
                className="flex items-center justify-center rounded-full bg-th-bkg-3 w-8 h-8 hover:text-th-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CurrencyDollarIcon className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>
        {selectedMangoGroup ? (
          <table className={`min-w-full`}>
            <thead>
              <tr className={`text-center text-th-fgd-4 mb-2 text-xs`}>
                <th scope="col" className={`flex-auto font-normal text-left`}>
                  Assets
                </th>
                <th
                  scope="col"
                  className={`flex-auto font-normal text-right px-2`}
                >
                  Deposits
                </th>
                <th
                  scope="col"
                  className={`flex-auto font-normal text-right px-2`}
                >
                  Borrows
                </th>
                <th
                  scope="col"
                  className="flex-auto font-normal flex justify-end items-center"
                >
                  <Tooltip content="Deposit APR and Borrow APY">
                    <div>Deposits / Borrows</div>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(symbols).map(([name], i) => (
                <tr key={name} className={`text-th-fgd-1`}>
                  <td className={`flex items-center py-2`}>
                    <img
                      alt=""
                      width="20"
                      height="20"
                      src={`/assets/icons/${name.toLowerCase()}.svg`}
                      className={`mr-2.5`}
                    />
                    <span>{name}</span>
                  </td>
                  <td className={`text-right px-2`}>
                    {selectedMarginAccount
                      ? floorToDecimal(
                          selectedMarginAccount.getUiDeposit(
                            selectedMangoGroup,
                            i
                          ),
                          tokenPrecision[name]
                        ).toFixed(tokenPrecision[name])
                      : (0).toFixed(tokenPrecision[name])}
                  </td>
                  <td className={`text-right px-2`}>
                    {selectedMarginAccount
                      ? selectedMarginAccount
                          .getUiBorrow(selectedMangoGroup, i)
                          .toFixed(tokenPrecision[name])
                      : (0).toFixed(tokenPrecision[name])}
                  </td>
                  <td className={`text-right`}>
                    <span className={`text-th-green`}>
                      {(selectedMangoGroup.getDepositRate(i) * 100).toFixed(2)}%
                    </span>
                    <span className={`text-th-fgd-4`}>{'  /  '}</span>
                    <span className={`text-th-red`}>
                      {(selectedMangoGroup.getBorrowRate(i) * 100).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <div className={`flex justify-center items-center mt-4`}>
          <Button
            onClick={() => setShowDepositModal(true)}
            className="w-1/3"
            disabled={!connected || loadingMarginAccount}
          >
            <span>Deposit</span>
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="ml-3 w-1/3"
            disabled={
              !connected || !selectedMarginAccount || loadingMarginAccount
            }
          >
            <span>Withdraw</span>
          </Button>
          <Button
            onClick={() => setShowBorrowModal(true)}
            className="ml-3 w-1/3"
            disabled={
              !connected || !selectedMarginAccount || loadingMarginAccount
            }
          >
            <span>Borrow</span>
          </Button>
        </div>
      </FloatingElement>
      {showDepositModal && (
        <DepositModal isOpen={showDepositModal} onClose={handleCloseDeposit} />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={handleCloseWithdraw}
        />
      )}
      {showBorrowModal && (
        <BorrowModal isOpen={showBorrowModal} onClose={handleCloseBorrow} />
      )}
      {showAccountsModal ? (
        <AccountsModal
          onClose={handleCloseAccounts}
          isOpen={showAccountsModal}
        />
      ) : null}
    </>
  )
}
