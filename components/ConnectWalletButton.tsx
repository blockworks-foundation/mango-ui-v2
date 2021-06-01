import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import useMangoStore from '../stores/useMangoStore'
import { Menu } from '@headlessui/react'
import {
  CurrencyDollarIcon,
  DuplicateIcon,
  LogoutIcon,
  PhotographIcon,
} from '@heroicons/react/outline'
import { WALLET_PROVIDERS, DEFAULT_PROVIDER } from '../hooks/useWallet'
import useLocalStorageState from '../hooks/useLocalStorageState'
import { abbreviateAddress, copyToClipboard } from '../utils'
import WalletSelect from './WalletSelect'
import { WalletIcon, ProfileIcon } from './icons'

const StyledWalletTypeLabel = styled.div`
  font-size: 0.65rem;
`

// const WALLET_OPTIONS = [
//   { name: 'Accounts', icon: <CurrencyDollarIcon /> },
//   { name: 'Copy address', icon: <DuplicateIcon /> },
//   { name: 'Disconnect', icon: <LogoutIcon /> },
// ]

const ConnectWalletButton = () => {
  const wallet = useMangoStore((s) => s.wallet.current)
  const connected = useMangoStore((s) => s.wallet.connected)
  const set = useMangoStore((s) => s.set)
  const [isCopied, setIsCopied] = useState(false)
  const [savedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )

  const WALLET_OPTIONS = [
    { name: 'Accounts', icon: <CurrencyDollarIcon /> },
    { name: 'Copy address', icon: <DuplicateIcon /> },
    {
      name: 'Disconnect',
      desc: connected ? abbreviateAddress(wallet.publicKey) : null,
      icon: <LogoutIcon />,
    },
  ]

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleWalletMenu = (option) => {
    if (option === 'Copy address') {
      copyToClipboard(wallet.publicKey)
      setIsCopied(true)
    } else {
      wallet.disconnect()
    }
  }

  const handleWalletConect = () => {
    wallet.connect()
    set((state) => {
      state.selectedMarginAccount.initialLoad = true
    })
  }

  return (
    <div>
      {connected && wallet?.publicKey ? (
        <Menu>
          {({ open }) => (
            <div className="relative h-full">
              <Menu.Button className="bg-th-fgd-4 flex items-center justify-center rounded-full w-9 h-9 text-th-fgd-2 focus:outline-none hover:bg-th-bkg-3 hover:text-th-fgd-3">
                <ProfileIcon className="fill-current h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="bg-th-bkg-1 mt-2 p-1 absolute right-0 shadow-lg outline-none rounded-md w-48 z-20">
                <>
                  {WALLET_OPTIONS.map(({ name, desc, icon }) => (
                    <Menu.Item key={name}>
                      <button
                        className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer focus:outline-none"
                        onClick={() => handleWalletMenu(name)}
                      >
                        <div className="w-4 h-4">{icon}</div>
                        <div className="pl-2 text-left">
                          {name}
                          {desc ? (
                            <div className="text-th-fgd-4 text-xs">{desc}</div>
                          ) : null}
                        </div>
                      </button>
                    </Menu.Item>
                  ))}
                </>
              </Menu.Items>
            </div>
          )}
        </Menu>
      ) : (
        <div className="bg-th-bkg-1 h-full flex divide-x divide-th-bkg-3 justify-between">
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
    </div>
  )
}

export default ConnectWalletButton
