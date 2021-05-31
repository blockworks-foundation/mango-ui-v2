import { useState } from 'react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import { abbreviateAddress } from '../utils'
import useMarginInfo from '../hooks/useMarginInfo'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import AccountAssets from '../components/account-page/AccountAssets'
import AccountBorrows from '../components/account-page/AccountBorrows'
import AccountOrders from '../components/account-page/AccountOrders'
import AccountHistory from '../components/account-page/AccountHistory'

const TABS = ['Assets', 'Borrows', 'Stats', 'Positions', 'Orders', 'History']

export default function Account() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const accountMarginInfo = useMarginInfo()
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const { symbols } = useMarketList()

  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
  }

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>Account</h1>
          {selectedMarginAccount ? (
            <div className="divide-x divide-th-fgd-4 flex flex-col-reverse justify-between w-full pt-4 sm:pt-0 sm:justify-end sm:flex-row">
              <div className="pr-4 text-xs text-th-fgd-1">
                <div className="pb-0.5 text-2xs text-th-fgd-3">Acc Owner</div>
                <a
                  className="default-transition flex items-center text-th-fgd-2"
                  href={`https://explorer.solana.com/address/${selectedMarginAccount?.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{abbreviateAddress(selectedMarginAccount?.owner)}</span>
                  <ExternalLinkIcon className={`h-3 w-3 ml-1`} />
                </a>
              </div>
              <div className="pl-4 text-xs text-th-fgd-1">
                <div className="pb-0.5 text-2xs text-th-fgd-3">Acc Address</div>
                <a
                  className="default-transition flex items-center text-th-fgd-2"
                  href={`https://explorer.solana.com/address/${selectedMarginAccount?.publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    {abbreviateAddress(selectedMarginAccount?.publicKey)}
                  </span>
                  <ExternalLinkIcon className={`h-3 w-3 ml-1`} />
                </a>
              </div>
            </div>
          ) : null}
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          <div className="pb-4 text-th-fgd-1 text-lg">Overview</div>
          {accountMarginInfo ? (
            <div className="grid grid-flow-col grid-cols-4 grid-rows-1 gap-4 pb-10">
              {accountMarginInfo.map((info) => (
                <div className="bg-th-bkg-3 p-3 rounded-md" key={info.label}>
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
          <TabContent activeTab={activeTab} symbols={symbols} />
        </div>
      </PageBodyContainer>
    </div>
  )
}

const TabContent = ({ activeTab, symbols }) => {
  switch (activeTab) {
    case 'Assets':
      return <AccountAssets symbols={symbols} />
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
      return <AccountAssets symbols={symbols} />
  }
}
