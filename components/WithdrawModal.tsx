import React, { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import Input from './Input'
import AccountSelect from './AccountSelect'
import { ElementTitle } from './styles'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import {
  getSymbolForTokenMintAddress,
  displayDepositsForMarginAccount,
  floorToDecimal,
} from '../utils/index'
import useConnection from '../hooks/useConnection'
import { borrowAndWithdraw, withdraw } from '../utils/mango'
import Loading from './Loading'
import Button from './Button'
import { notify } from '../utils/notifications'
import Switch from './Switch'
import Tooltip from './Tooltip'
import { InformationCircleIcon } from '@heroicons/react/outline'
import { Transition } from '@headlessui/react'
import { PublicKey } from '@solana/web3.js'
import { MarginAccount, uiToNative } from '@blockworks-foundation/mango-client'

const WithdrawModal = ({ isOpen, onClose }) => {
  const [inputAmount, setInputAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [includeBorrow, setIncludeBorrow] = useState(false)
  const { getTokenIndex, symbols } = useMarketList()
  const { connection, programId } = useConnection()
  const walletAccounts = useMangoStore((s) => s.wallet.balances)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const mintDecimals = useMangoStore((s) => s.selectedMangoGroup.mintDecimals)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const actions = useMangoStore((s) => s.actions)
  const withdrawAccounts = useMemo(
    () =>
      walletAccounts.filter((acc) =>
        Object.values(symbols).includes(acc.account.mint.toString())
      ),
    [symbols, walletAccounts]
  )
  const [selectedAccount, setSelectedAccount] = useState(withdrawAccounts[0])
  const mintAddress = useMemo(() => selectedAccount?.account.mint.toString(), [
    selectedAccount,
  ])
  const tokenIndex = useMemo(() => getTokenIndex(mintAddress), [
    mintAddress,
    getTokenIndex,
  ])

  useEffect(async () => {
    if (!selectedMangoGroup || !selectedMarginAccount) return

    const prices = await selectedMangoGroup.getPrices(connection)
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

    // simulate change to deposits & borrow based on input amount
    const newDeposit = Math.max(0, deposits - inputAmount)
    const newBorrows = borrows + Math.max(0, inputAmount - deposits)

    // clone MarginAccount and arrays to not modify selectedMarginAccount
    const simulation = new MarginAccount(null, selectedMarginAccount)
    simulation.deposits = [...selectedMarginAccount.deposits]
    simulation.borrows = [...selectedMarginAccount.borrows]

    // update with simulated values
    simulation.deposits[tokenIndex] =
      uiToNative(newDeposit, mintDecimals) / groupIndex.deposit
    simulation.borrows[tokenIndex] =
      uiToNative(newBorrows, mintDecimals) / groupIndex.borrow

    const equity = simulation.computeValue(selectedMangoGroup, prices)
    const assetsVal = simulation.getAssetsVal(selectedMangoGroup, prices)
    const liabsVal = simulation.getLiabsVal(selectedMangoGroup, prices)
    const collateralRatio = simulation.getCollateralRatio(
      selectedMangoGroup,
      prices
    )
    const leverage = 1 / Math.max(0, collateralRatio - 1)
    console.log('simulation', {
      equity,
      assetsVal,
      liabsVal,
      collateralRatio,
      leverage,
    })
  }, [inputAmount, tokenIndex, selectedMarginAccount, selectedMangoGroup])

  const handleSetSelectedAccount = (val) => {
    setInputAmount('')
    setSelectedAccount(val)
  }

  const withdrawDisabled = Number(inputAmount) <= 0

  const getMaxForSelectedAccount = () => {
    return displayDepositsForMarginAccount(
      selectedMarginAccount,
      selectedMangoGroup,
      tokenIndex
    )
  }

  const setMaxForSelectedAccount = () => {
    setInputAmount(getMaxForSelectedAccount().toString())
  }

  const handleIncludeBorrowSwitch = (checked) => {
    setIncludeBorrow(checked)
    setInputAmount('')
  }

  const setMaxBorrowForSelectedAccount = async () => {
    // get index prices
    const prices = await selectedMangoGroup.getPrices(connection)
    // get value of margin account assets minus the selected token
    const assetsVal =
      selectedMarginAccount.getAssetsVal(selectedMangoGroup, prices) -
      getMaxForSelectedAccount() * prices[tokenIndex]
    const currentLiabs = selectedMarginAccount.getLiabsVal(
      selectedMangoGroup,
      prices
    )
    // multiply by 0.99 and subtract 0.01 to account for rounding issues
    const liabsAvail = (assetsVal / 1.2 - currentLiabs) * 0.99 - 0.01
    const amountToWithdraw =
      liabsAvail / prices[tokenIndex] + getMaxForSelectedAccount()

    if (amountToWithdraw > 0) {
      setInputAmount(
        floorToDecimal(
          amountToWithdraw,
          mintDecimals[getTokenIndex(mintAddress)]
        ).toString()
      )
    } else {
      setInputAmount('0')
    }
  }

  const handleWithdraw = () => {
    setSubmitting(true)
    const marginAccount = useMangoStore.getState().selectedMarginAccount.current
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current
    const wallet = useMangoStore.getState().wallet.current
    if (!marginAccount || !mangoGroup) return

    if (!includeBorrow) {
      withdraw(
        connection,
        new PublicKey(programId),
        mangoGroup,
        marginAccount,
        wallet,
        selectedAccount.account.mint,
        selectedAccount.publicKey,
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
          console.warn('Error withdrawing:', err)
          notify({
            message: 'Could not perform withdraw',
            description: `${err}`,
            type: 'error',
          })
          onClose()
        })
    } else {
      borrowAndWithdraw(
        connection,
        new PublicKey(programId),
        mangoGroup,
        marginAccount,
        wallet,
        selectedAccount.account.mint,
        selectedAccount.publicKey,
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
            type: 'error',
          })
          onClose()
        })
    }
  }

  const getBorrowAmount = () => {
    const tokenBalance = getMaxForSelectedAccount()
    const borrowAmount = parseFloat(inputAmount) - tokenBalance
    return borrowAmount > 0 ? borrowAmount : 0
  }

  if (!selectedAccount) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <ElementTitle noMarignBottom>Withdraw Funds</ElementTitle>
      </Modal.Header>
      <>
        <AccountSelect
          hideAddress
          accounts={withdrawAccounts}
          selectedAccount={selectedAccount}
          onSelectAccount={handleSetSelectedAccount}
          getBalance={getMaxForSelectedAccount}
          symbols={symbols}
        />
        <div className="flex items-center jusitfy-between text-th-fgd-1 mt-4 p-2 rounded-md bg-th-bkg-3">
          <div className="flex items-center text-fgd-1 pr-4">
            <span>Borrow Funds</span>
            <Tooltip content="Interest is charged on your borrowed balance and is subject to change.">
              <InformationCircleIcon
                className={`h-5 w-5 ml-2 text-th-primary cursor-help`}
              />
            </Tooltip>
          </div>
          <Switch
            checked={includeBorrow}
            className="ml-auto"
            onChange={(checked) => handleIncludeBorrowSwitch(checked)}
          />
        </div>
        <div className="flex justify-between pb-2 pt-4">
          <div className="text-th-fgd-1">Amount</div>
          <div className="flex space-x-4">
            <div
              className="text-th-fgd-1 underline cursor-pointer default-transition hover:text-th-primary hover:no-underline"
              onClick={
                includeBorrow
                  ? setMaxBorrowForSelectedAccount
                  : setMaxForSelectedAccount
              }
            >
              {includeBorrow ? 'Max with Borrow' : 'Max'}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Input
            type="number"
            min="0"
            className={`border border-th-fgd-4 flex-grow pr-11`}
            placeholder="0.00"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            suffix={getSymbolForTokenMintAddress(
              selectedAccount?.account?.mint.toString()
            )}
          />
        </div>
        {includeBorrow ? (
          <Transition
            appear={true}
            className="p-2 bg-th-bkg-1 rounded-md mt-4"
            show={includeBorrow}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="flex justify-between pb-2">
              <div className="text-th-fgd-3">Borrow Amount</div>
              <div className="text-th-fgd-1">{`${getBorrowAmount()} ${getSymbolForTokenMintAddress(
                selectedAccount?.account?.mint.toString()
              )}`}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-th-fgd-3">Current APR</div>
              <div className="text-th-fgd-1">
                {(selectedMangoGroup.getBorrowRate(tokenIndex) * 100).toFixed(
                  2
                )}
                %
              </div>
            </div>
          </Transition>
        ) : null}
        <div className={`mt-5 flex justify-center`}>
          <Button
            onClick={handleWithdraw}
            disabled={withdrawDisabled}
            className="w-full"
          >
            <div className={`flex items-center justify-center`}>
              {submitting && <Loading className="-ml-1 mr-3" />}
              {`Withdraw ${
                inputAmount ? inputAmount : ''
              } ${getSymbolForTokenMintAddress(
                selectedAccount?.account?.mint.toString()
              )}
              `}
            </div>
          </Button>
        </div>
      </>
    </Modal>
  )
}

export default React.memo(WithdrawModal)
