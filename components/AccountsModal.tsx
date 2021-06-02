import React, { FunctionComponent, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { ChevronLeftIcon, PlusCircleIcon } from '@heroicons/react/outline'
import useMangoStore from '../stores/useMangoStore'
import { MarginAccount } from '@blockworks-foundation/mango-client'
import { abbreviateAddress } from '../utils'
import Modal from './Modal'
import { ElementTitle } from './styles'
import Button, { LinkButton } from './Button'
import { WalletIcon } from './icons'
import NewAccount from './NewAccount'

interface AccountsModalProps {
  onClose: () => void
  isOpen: boolean
  tokenSymbol?: string
}

const AccountsModal: FunctionComponent<AccountsModalProps> = ({
  isOpen,
  onClose,
  tokenSymbol = '',
}) => {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false)
  const marginAccounts = useMangoStore((s) => s.marginAccounts)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const setMangoStore = useMangoStore((s) => s.set)

  const handleMarginAccountChange = (marginAccount: MarginAccount) => {
    setMangoStore((state) => {
      state.selectedMarginAccount.current = marginAccount
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {marginAccounts.length > 0 ? (
        !showNewAccountForm ? (
          <>
            <Modal.Header>
              <ElementTitle noMarignBottom>Margin Accounts</ElementTitle>
            </Modal.Header>
            <div className="flex items-center justify-between pb-3 text-th-fgd-1">
              <div className="font-semibold">
                {marginAccounts.length > 1
                  ? 'Select an account'
                  : 'Your Account'}
              </div>
              <Button
                className="text-xs flex items-center justify-center pt-0 pb-0 h-8 pl-3 pr-3"
                onClick={() => setShowNewAccountForm(true)}
              >
                <div className="flex items-center">
                  <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                  New
                </div>
              </Button>
            </div>
            <RadioGroup
              value={selectedMarginAccount}
              onChange={(acc) => handleMarginAccountChange(acc)}
            >
              <RadioGroup.Label className="sr-only">
                Select a Margin Account
              </RadioGroup.Label>
              <div className="space-y-2">
                {marginAccounts
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.publicKey.toBase58() > b.publicKey.toBase58() && 1) ||
                      -1
                  )
                  .map((account, i) => (
                    <RadioGroup.Option
                      key={account.publicKey.toString()}
                      value={account}
                      className={({ active, checked }) =>
                        `${
                          checked
                            ? 'bg-th-bkg-3 ring-1 ring-th-green ring-inset'
                            : 'bg-th-bkg-1'
                        }
                      relative rounded-md w-full px-3 py-3 cursor-pointer default-transition flex hover:bg-th-bkg-3 focus:outline-none`
                      }
                    >
                      {({ active, checked }) => (
                        <>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <div className="text-sm">
                                <RadioGroup.Label className="cursor-pointer flex items-center text-th-fgd-1">
                                  <WalletIcon className="h-4 w-4 fill-current mr-2.5" />
                                  <div>
                                    <div className="pb-0.5">
                                      Account {i + 1}
                                    </div>
                                    <div className="text-th-fgd-3 text-xs">
                                      {abbreviateAddress(account.publicKey)}
                                    </div>
                                  </div>
                                </RadioGroup.Label>
                              </div>
                            </div>
                            {checked && (
                              <div className="flex-shrink-0 text-th-green">
                                <CheckCircleIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
              </div>
            </RadioGroup>
          </>
        ) : (
          <>
            <NewAccount
              onAccountCreation={() => setShowNewAccountForm(false)}
            />
            <LinkButton
              className="flex items-center mt-4 text-th-fgd-3"
              onClick={() => setShowNewAccountForm(false)}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back
            </LinkButton>
          </>
        )
      ) : (
        <NewAccount onAccountCreation={() => setShowNewAccountForm(false)} />
      )}
    </Modal>
  )
}

export default React.memo(AccountsModal)
