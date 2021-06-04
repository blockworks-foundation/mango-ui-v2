import { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import useMangoStore from '../stores/useMangoStore'
import { Menu } from '@headlessui/react'
import {
  CurrencyDollarIcon,
  DuplicateIcon,
  LogoutIcon,
} from '@heroicons/react/outline'
import { WALLET_PROVIDERS, DEFAULT_PROVIDER } from '../hooks/useWallet'
import useLocalStorageState from '../hooks/useLocalStorageState'
import { abbreviateAddress, copyToClipboard } from '../utils'
import WalletSelect from './WalletSelect'
import { WalletIcon, ProfileIcon } from './icons'
import AccountsModal from './AccountsModal'

const StyledWalletTypeLabel = styled.div`
  font-size: 0.65rem;
`

const ConnectWalletButton = () => {
  const wallet = useMangoStore((s) => s.wallet.current)
  const connected = useMangoStore((s) => s.wallet.connected)
  const set = useMangoStore((s) => s.set)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [savedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )

  const handleWalletConect = () => {
    wallet.connect()
    set((state) => {
      state.selectedMarginAccount.initialLoad = true
    })
  }

  const handleCloseAccounts = useCallback(() => {
    setShowAccountsModal(false)
  }, [])

  return (
    <>
      {connected && wallet?.publicKey ? (
        <Menu>
          <div className="relative h-full">
            <Menu.Button className="bg-th-fgd-4 flex items-center justify-center rounded-full w-9 h-9 text-th-fgd-2 focus:outline-none hover:bg-th-bkg-3 hover:text-th-fgd-3">
              <ProfileIcon className="fill-current h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="bg-th-bkg-1 mt-2 p-1 absolute right-0 shadow-lg outline-none rounded-md w-48 z-20">
              <Menu.Item>
                <button
                  className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer focus:outline-none"
                  onClick={() => setShowAccountsModal(true)}
                >
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <div className="pl-2 text-left">Accounts</div>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer focus:outline-none"
                  onClick={() => copyToClipboard(wallet?.publicKey)}
                >
                  <DuplicateIcon className="h-4 w-4" />
                  <div className="pl-2 text-left">Copy address</div>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer focus:outline-none"
                  onClick={() => wallet.disconnect()}
                >
                  <LogoutIcon className="h-4 w-4" />
                  <div className="pl-2 text-left">
                    <div className="pb-0.5">Disconnect</div>
                    <div className="text-th-fgd-4 text-xs">
                      {abbreviateAddress(wallet?.publicKey)}
                    </div>
                  </div>
                </button>
              </Menu.Item>
            </Menu.Items>
          </div>
        </Menu>
      ) : (
        <div className="bg-th-bkg-1 h-14 flex divide-x divide-th-bkg-3 justify-between">
          <button
            onClick={handleWalletConect}
            disabled={!wallet}
            className="rounded-none text-th-primary hover:bg-th-bkg-3 focus:outline-none disabled:text-th-fgd-4 disabled:cursor-wait"
          >
            <div className="flex flex-row items-center px-3 justify-center h-full default-transition hover:text-th-fgd-1">
              <WalletIcon className="w-4 h-4 mr-2 fill-current" />
              <div>
                <div className="mb-0.5 whitespace-nowrap">Connect Wallet</div>
                <StyledWalletTypeLabel className="font-normal text-th-fgd-3 text-left leading-3 tracking-wider">
                  {
                    WALLET_PROVIDERS.find((p) => p.url === savedProviderUrl)
                      ?.name
                  }
                </StyledWalletTypeLabel>
              </div>
            </div>
          </button>
          <div className="relative h-full">
            <WalletSelect isPrimary />
          </div>
        </div>
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

export default ConnectWalletButton
