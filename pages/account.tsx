import { useCallback, useEffect, useState } from 'react'
import {
  CurrencyDollarIcon,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  DuplicateIcon,
} from '@heroicons/react/outline'
import useMangoStore from '../stores/useMangoStore'
import { abbreviateAddress, copyToClipboard } from '../utils'
import useMarginInfo from '../hooks/useMarginInfo'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import AccountAssets from '../components/account-page/AccountAssets'
import AccountBorrows from '../components/account-page/AccountBorrows'
import AccountOrders from '../components/account-page/AccountOrders'
import AccountHistory from '../components/account-page/AccountHistory'
import AccountsModal from '../components/AccountsModal'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import AccountNameModal from '../components/AccountNameModal'
import { MarginAccount } from '@blockworks-foundation/mango-client'

const TABS = [
  'Assets',
  'Borrows',
  // 'Stats',
  // 'Positions',
  'Orders',
  'History',
]

export function getMarginInfoString(marginAccount: MarginAccount) {
  return marginAccount?.info
    ? String.fromCharCode(...marginAccount?.info).replaceAll(
        String.fromCharCode(0),
        ''
      )
    : ''
}

export default function Account() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const accountMarginInfo = useMarginInfo()
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const marginInfoString = getMarginInfoString(selectedMarginAccount)
  const [accountName, setAccountName] = useState(marginInfoString)

  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
  }
  const handleCloseAccountsModal = useCallback(() => {
    setShowAccountsModal(false)
  }, [])
  const handleCloseNameModal = useCallback(() => {
    setShowNameModal(false)
  }, [])

  useEffect(() => {
    if (selectedMarginAccount) {
      const marginInfoString = getMarginInfoString(selectedMarginAccount)
      setAccountName(marginInfoString)
    } else {
      setAccountName('')
    }
  }, [selectedMarginAccount])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopyPublicKey = (code) => {
    setIsCopied(true)
    copyToClipboard(code)
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col md:flex-row md:items-end justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          {selectedMarginAccount ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end pb-4 md:pb-0">
                <h1 className={`font-semibold mr-3 text-th-fgd-1 text-2xl`}>
                  {accountName ? accountName : 'Account'}
                </h1>
                <div className="flex items-center pb-0.5 text-th-fgd-3 ">
                  {abbreviateAddress(selectedMarginAccount.publicKey)}
                  <DuplicateIcon
                    className="cursor-pointer default-transition h-4 w-4 ml-1.5 hover:text-th-fgd-1"
                    onClick={() =>
                      handleCopyPublicKey(selectedMarginAccount.publicKey)
                    }
                  />
                  {isCopied ? (
                    <div className="ml-2 text-th-fgd-2 text-xs">Copied!</div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  className="text-xs flex flex-grow items-center justify-center mr-2 pt-0 pb-0 h-8 pl-3 pr-3"
                  onClick={() => setShowNameModal(true)}
                >
                  <div className="flex items-center">
                    <PencilIcon className="h-4 w-4 mr-1.5" />
                    {accountName ? 'Edit Name' : 'Add Name'}
                  </div>
                </Button>
                <a
                  className="border border-th-fgd-4 bg-th-bkg-2 default-transition flex flex-grow font-bold h-8 items-center justify-center pl-3 pr-3 rounded-md text-th-fgd-1 text-xs hover:bg-th-bkg-3 hover:text-th-fgd-1 focus:outline-none"
                  href={`https://explorer.solana.com/address/${selectedMarginAccount?.publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Explorer</span>
                  <ExternalLinkIcon className={`h-4 w-4 ml-1.5`} />
                </a>
                <Button
                  className="text-xs flex flex-grow items-center justify-center ml-2 pt-0 pb-0 h-8 pl-3 pr-3"
                  onClick={() => setShowAccountsModal(true)}
                >
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                    Accounts
                  </div>
                </Button>
              </div>
            </>
          ) : null}
        </div>
        <div className="bg-th-bkg-2 overflow-none p-6 rounded-lg">
          {selectedMarginAccount ? (
            <>
              <div className="pb-4 text-th-fgd-1 text-lg">Overview</div>
              {accountMarginInfo ? (
                <div className="grid grid-flow-col grid-cols-1 grid-rows-4 sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-4 pb-10">
                  {accountMarginInfo.map((info) => (
                    <div
                      className="bg-th-bkg-3 p-3 rounded-md"
                      key={info.label}
                    >
                      <div className="pb-0.5 text-xs text-th-fgd-3">
                        {info.label}
                      </div>
                      <div className="flex items-center">
                        {info.icon}
                        <div className="text-lg text-th-fgd-1">{`${info.currency}${info.value}${info.unit}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="border-b border-th-fgd-4 mb-4">
                <nav className={`-mb-px flex space-x-6`} aria-label="Tabs">
                  {TABS.map((tabName) => (
                    <a
                      key={tabName}
                      onClick={() => handleTabChange(tabName)}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold cursor-pointer default-transition hover:opacity-100
                  ${
                    activeTab === tabName
                      ? `border-th-primary text-th-primary`
                      : `border-transparent text-th-fgd-4 hover:text-th-primary`
                  }
                `}
                    >
                      {tabName}
                    </a>
                  ))}
                </nav>
              </div>
              <TabContent activeTab={activeTab} />
            </>
          ) : connected ? (
            <EmptyState
              buttonText="Create Account"
              icon={<CurrencyDollarIcon />}
              onClickButton={() => setShowAccountsModal(true)}
              title="No Account Found"
            />
          ) : (
            <EmptyState
              desc="Connect a wallet to view your account"
              icon={<LinkIcon />}
              title="Connect Wallet"
            />
          )}
        </div>
      </PageBodyContainer>
      {showAccountsModal ? (
        <AccountsModal
          onClose={handleCloseAccountsModal}
          isOpen={showAccountsModal}
        />
      ) : null}
      {showNameModal ? (
        <AccountNameModal
          accountName={accountName}
          isOpen={showNameModal}
          onClose={handleCloseNameModal}
        />
      ) : null}
    </div>
  )
}

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'Assets':
      return <AccountAssets />
    case 'Borrows':
      return <AccountBorrows />
    case 'Stats':
      return <div>Stats</div>
    case 'Positions':
      return <div>Positions</div>
    case 'Orders':
      return <AccountOrders />
    case 'History':
      return <AccountHistory />
    default:
      return <AccountAssets />
  }
}
