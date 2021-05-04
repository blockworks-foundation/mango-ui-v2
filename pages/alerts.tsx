import { useMemo, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import dayjs from 'dayjs'
import styled from '@emotion/styled'
import {
  BadgeCheckIcon,
  BellIcon,
  DeviceMobileIcon,
  LinkIcon,
  MailIcon,
} from '@heroicons/react/outline'
import { TelegramIcon } from '../components/icons'
import useAlerts from '../hooks/useAlerts'
import { abbreviateAddress } from '../utils'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Loading from '../components/Loading'
import AlertsModal from '../components/AlertsModal'

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const StyledDiv = styled.div`
  font-size: 0.75rem;
`

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
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all `}>
      <TopBar />
      <div className="min-h-screen grid grid-cols-12 gap-4 pb-10">
        <div className="col-start-3 col-span-8">
          <div className="flex items-center justify-between pt-8 pb-6 md:pt-10">
            <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>Alerts</h1>
            <Button
              disabled={!connected}
              onClick={() => setOpenAlertModal(true)}
            >
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
                  <nav className={`-mb-px flex space-x-8`} aria-label="Tabs">
                    {TABS.map((tabName) => (
                      <a
                        key={tabName}
                        onClick={() => handleTabChange(tabName)}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold cursor-pointer default-transition
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
        </div>
      </div>
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
          <AlertItem alert={alert} key={alert.timestamp} />
        ))
      )
    case 'Triggered':
      return triggeredAlerts.length === 0 ? (
        <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
          <BadgeCheckIcon className="w-6 h-6 mb-1 text-th-green" />
          <div className="font-bold text-lg pb-1">Smooth Sailing</div>
          <p className="mb-0 text-center">
            None of your liquidation alerts have been triggered.
          </p>
        </div>
      ) : (
        triggeredAlerts.map((alert) => (
          <AlertItem alert={alert} key={alert.timestamp} />
        ))
      )
    default:
      return activeAlerts.map((alert) => (
        <AlertItem alert={alert} key={alert.timestamp} />
      ))
  }
}

const formatProvider = (provider) => {
  if (provider === 'mail') {
    return (
      <span className="flex items-center mr-1">
        <MailIcon className="w-4 h-4 mr-1.5" />
        E-mail
      </span>
    )
  } else if (provider === 'sms') {
    return (
      <span className="flex items-center mr-1">
        <DeviceMobileIcon className="w-4 h-4 mr-1.5" />
        SMS
      </span>
    )
  } else {
    return (
      <span className="flex items-center mr-1">
        <TelegramIcon className="w-4 h-4 mr-1.5" />
        Telegram
      </span>
    )
  }
}

const AlertItem = ({ alert }) => (
  <div className="border border-th-bkg-3 mb-2 p-3 rounded-lg">
    <div className="flex justify-between pb-0.5">
      <div className="flex">
        {formatProvider(alert.alertProvider)} below{' '}
        {alert.collateralRatioThresh}%
      </div>
      <div className="text-xs text-th-fgd-4">
        {dayjs(alert.timestamp).fromNow()}
      </div>
    </div>
    <div className="text-th-fgd-3 text-xs mb-1 pl-6">
      Acc: {abbreviateAddress(alert.acc)}
    </div>
    {alert.open ? (
      <StyledDiv className="flex items-center text-th-fgd-4 pl-6">
        <span className="flex h-2 w-2 mr-1 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-th-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-th-green"></span>
        </span>
        Active
      </StyledDiv>
    ) : (
      <StyledDiv className="flex items-center text-th-fgd-4 pl-6">
        <span className="flex h-2 w-2 mr-1 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-th-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-th-red"></span>
        </span>
        Triggered{' '}
        {alert.triggeredTimestamp
          ? dayjs(alert.triggeredTimestamp).fromNow()
          : null}
      </StyledDiv>
    )}
  </div>
)
