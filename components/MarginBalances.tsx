import { useCallback, useState } from 'react'
import FloatingElement from './FloatingElement'
import { ElementTitle } from './styles'
import useMangoStore from '../stores/useMangoStore'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import Button from './Button'
import { useBalances } from '../hooks/useBalances'

export default function MarginBalances() {
  const balances = useBalances()
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
  }, [])

  const handleCloseWithdraw = useCallback(() => {
    setShowWithdrawModal(false)
  }, [])

  return (
    <>
      <FloatingElement>
        <ElementTitle>Assets</ElementTitle>
        {balances
          ? balances.map((balance) => (
              <div className={`flex justify-between pt-2 pb-2`}>
                <div className="flex items-center">
                  <img
                    alt=""
                    width="20"
                    height="20"
                    src={`/assets/icons/${balance.coin.toLowerCase()}.svg`}
                    className={`mr-2`}
                  />
                  <div className="flex items-end">
                    {balance.coin}{' '}
                    <span className="text-th-fgd-4 ml-1.5 text-xs">
                      Available
                    </span>
                  </div>
                </div>
                <div className={`text-th-fgd-1`}>{balance.net}</div>
              </div>
            ))
          : null}
        <div className={`flex justify-center items-center mt-4`}>
          <Button
            onClick={() => setShowDepositModal(true)}
            className="w-1/2"
            disabled={!connected || loadingMarginAccount}
          >
            <span>Deposit</span>
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="ml-4 w-1/2"
            disabled={
              !connected || !selectedMarginAccount || loadingMarginAccount
            }
          >
            <span>Withdraw</span>
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
    </>
  )
}
