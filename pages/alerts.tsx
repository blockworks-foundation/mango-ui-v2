import { useMemo, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import dayjs from 'dayjs'
import { BadgeCheckIcon, BellIcon, LinkIcon } from '@heroicons/react/outline'
import useAlerts from '../hooks/useAlerts'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Loading from '../components/Loading'
import AlertsModal from '../components/AlertsModal'
import AlertItem from '../components/AlertItem'
import PageBodyContainer from '../components/PageBodyContainer'

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const TABS = ['Active', 'Triggered']

export default function Alerts() {
  const connected = useMangoStore((s) => s.wallet.connected)
  const [triggeredAlerts, setTriggeredAlerts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const { alerts, loadAlerts } = useAlerts()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [openAlertModal, setOpenAlertModal] = useState(false)

  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
  }

  useMemo(() => {
    const triggered = alerts
      .filter((alert) => !alert.open)
      .sort((a, b) => b.timestamp - a.timestamp)
    setTriggeredAlerts(triggered)
  }, [alerts])

  useMemo(() => {
    const active = alerts
      .filter((alert) => alert.open)
      .sort((a, b) => b.timestamp - a.timestamp)
    setActiveAlerts(active)
  }, [alerts])

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex items-center justify-between pt-8 pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>Alerts</h1>
          <Button disabled={!connected} onClick={() => setOpenAlertModal(true)}>
            Create
          </Button>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">
          {loadAlerts ? (
            <div className="flex items-center justify-center text-th-primary h-full">
              <Loading />
            </div>
          ) : connected ? (
            <>
              <div className="border-b border-th-fgd-4 mb-6">
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
              <TabContent
                activeTab={activeTab}
                activeAlerts={activeAlerts}
                triggeredAlerts={triggeredAlerts}
              />
            </>
          ) : (
            <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
              <LinkIcon className="w-6 h-6 mb-1 text-th-primary" />
              <div className="font-bold text-lg pb-1">Connect Wallet</div>
              <p className="mb-0 text-center">
                Connect your wallet to view and create liquidation alerts.
              </p>
            </div>
          )}
        </div>
      </PageBodyContainer>
      {openAlertModal ? (
        <AlertsModal
          isOpen={openAlertModal}
          onClose={() => setOpenAlertModal(false)}
        />
      ) : null}
    </div>
  )
}

const TabContent = ({ activeTab, activeAlerts, triggeredAlerts }) => {
  switch (activeTab) {
    case 'Active':
      return activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
          <BellIcon className="w-6 h-6 mb-1 text-th-primary" />
          <div className="font-bold text-lg pb-1">No Alerts Found</div>
          <p className="mb-0 text-center">
            Get notified when your account is in danger of liquidation.
          </p>
        </div>
      ) : (
        activeAlerts.map((alert) => (
          <AlertItem alert={alert} key={alert.timestamp} isLarge />
        ))
      )
    case 'Triggered':
      return triggeredAlerts.length === 0 ? (
        <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
          <BadgeCheckIcon className="w-6 h-6 mb-1 text-th-green" />
          <div className="font-bold text-lg pb-1">Smooth Sailing</div>
          <p className="mb-0 text-center">
            None of your active liquidation alerts have been triggered.
          </p>
        </div>
      ) : (
        triggeredAlerts.map((alert) => (
          <AlertItem alert={alert} key={alert.timestamp} isLarge />
        ))
      )
    default:
      return activeAlerts.map((alert) => (
        <AlertItem alert={alert} key={alert.timestamp} />
      ))
  }
}
