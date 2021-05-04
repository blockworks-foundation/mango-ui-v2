import { Fragment, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import styled from '@emotion/styled'
import Router from 'next/router'
import {
  BadgeCheckIcon,
  BellIcon,
  DeviceMobileIcon,
  MailIcon,
} from '@heroicons/react/outline'
import { TelegramIcon } from './icons'
import useAlerts from '../hooks/useAlerts'
import useLocalStorageState from '../hooks/useLocalStorageState'
import { abbreviateAddress } from '../utils'
import { Popover, Transition } from '@headlessui/react'
import { LinkButton } from './Button'
import Loading from './Loading'
import AlertsModal from './AlertsModal'

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const StyledStatus = styled.div`
  font-size: 0.75rem;
`

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`

const AlertsList = () => {
  const [openAlertModal, setOpenAlertModal] = useState(false)
  const [triggeredAlerts, setTriggeredAlerts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState(false)
  const { alerts, loadAlerts } = useAlerts()

  const [
    triggeredAlertsLength,
    setTriggeredAlertsLength,
  ] = useLocalStorageState('triggeredAlertsLength', 0)

  const [alertsCount, setAlertsCount] = useLocalStorageState('alertsCount', 0)

  const [clearAlertsTimestamp, setClearAlertsTimestamp] = useLocalStorageState(
    'clearAlertsTimestamp',
    null
  )

  // Increment the alerts count when the triggered alerts length is greater than the length in localStorage
  useEffect(() => {
    if (triggeredAlerts.length > 0) {
      setTriggeredAlertsLength(triggeredAlerts.length)
      if (triggeredAlerts.length > triggeredAlertsLength) {
        setAlertsCount(alertsCount + 1)
      }
    }
  }, [triggeredAlerts])

  // Old alerts won't have a triggeredTimestamp to sort by as it was added after alerts had started generating
  useEffect(() => {
    const triggered = alerts.filter((alert) =>
      clearAlertsTimestamp
        ? !alert.open && alert.triggeredTimestamp > clearAlertsTimestamp
        : !alert.open
    )

    // Add triggeredTimestamp to alerts that don't have that key and order them at the bottom of the list
    for (let i = 0; i < triggered.length; i++) {
      if (!triggered[i].triggeredTimestamp) {
        triggered[i].triggeredTimestamp = 957408447
      }
    }

    // Sort from newest to oldest
    setTriggeredAlerts(
      triggered.sort((a, b) => b.triggeredTimestamp - a.triggeredTimestamp)
    )
  }, [alerts, clearAlertsTimestamp])

  useMemo(() => {
    const active = !!alerts.find((alert) => alert.open)
    setActiveAlerts(active)
  }, [alerts])

  return (
    <>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="focus:outline-none">
              {alertsCount > 0 ? (
                <StyledAlertCount className="w-4 h-4 bg-th-red rounded-full absolute -top-1 -right-1 flex items-center justify-center">
                  {alertsCount}
                </StyledAlertCount>
              ) : null}
              <div
                className="flex items-center justify-center rounded-full bg-th-bkg-3 w-8 h-8 default-transition hover:text-th-primary"
                onClick={() => setAlertsCount(0)}
              >
                <BellIcon className="w-4 h-4" />
              </div>
            </Popover.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                static
                className="absolute z-10 mt-3 transform -translate-x-1/2 left-1/2 w-64"
              >
                <div className="bg-th-bkg-1 p-4 overflow-auto max-h-80 rounded-lg shadow-lg thin-scroll">
                  {loadAlerts ? (
                    <div className="flex items-center justify-center text-th-primary h-40">
                      <Loading />
                    </div>
                  ) : (
                    <>
                      {alerts.length === 0 ? (
                        <>
                          <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
                            <BellIcon className="w-6 h-6 mb-1 text-th-primary" />
                            <div className="font-bold text-base pb-1">
                              No Alerts Found
                            </div>
                            <p className="mb-0 text-center text-xs">
                              Get notified when your account is in danger of
                              liquidation.
                            </p>
                          </div>
                          <LinkButton
                            onClick={() => setOpenAlertModal(true)}
                            className="w-full text-xs text-th-primary"
                          >
                            Create Liquidation Alert
                          </LinkButton>
                        </>
                      ) : triggeredAlerts.length === 0 ? (
                        <>
                          <div className="flex flex-col items-center text-th-fgd-1 px-4 pb-2 rounded-lg">
                            <BadgeCheckIcon className="w-6 h-6 mb-1 text-th-green" />
                            <div className="font-bold text-base pb-1">
                              Smooth Sailing
                            </div>
                            <p className="mb-0 text-center text-xs">
                              None of your liquidation alerts have been
                              triggered.
                            </p>
                          </div>
                          <LinkButton
                            onClick={() => Router.push('/alerts')}
                            className="w-full text-xs text-th-primary"
                          >
                            View All
                          </LinkButton>
                        </>
                      ) : (
                        <>
                          <div className="pb-3">
                            <div className="flex items-center justify-between text-th-fgd-1 font-bold">
                              Triggered Alerts
                              <LinkButton
                                onClick={() => Router.push('/alerts')}
                                className="text-th-primary text-xs"
                              >
                                View All
                              </LinkButton>
                            </div>
                            {!activeAlerts ? (
                              <div className="text-xs text-th-fgd-4 pt-1">
                                None of your alerts are active.
                              </div>
                            ) : null}
                          </div>

                          {triggeredAlerts.map((alert) => (
                            <AlertItem alert={alert} key={alert.timestamp} />
                          ))}
                          <div className="flex justify-between pt-2">
                            <LinkButton
                              onClick={() =>
                                setClearAlertsTimestamp(
                                  triggeredAlerts[0].triggeredTimestamp
                                )
                              }
                              className="text-th-fgd-3 text-xs"
                            >
                              Clear
                            </LinkButton>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      {openAlertModal ? (
        <AlertsModal
          isOpen={openAlertModal}
          onClose={() => setOpenAlertModal(false)}
        />
      ) : null}
    </>
  )
}

export default AlertsList

const formatProvider = (provider) => {
  if (provider === 'mail') {
    return (
      <span className="flex items-center mr-1">
        <MailIcon className="w-4 h-4 mr-2" />
        E-mail
      </span>
    )
  } else if (provider === 'sms') {
    return (
      <span className="flex items-center mr-1">
        <DeviceMobileIcon className="w-4 h-4 mr-2" />
        SMS
      </span>
    )
  } else {
    return (
      <span className="flex items-center mr-1">
        <TelegramIcon className="w-4 h-4 mr-2" />
        Telegram
      </span>
    )
  }
}

const AlertItem = ({ alert }) => (
  <div className="border border-th-bkg-3 mb-2 p-2 rounded-lg">
    <div className="flex pb-0.5">
      {formatProvider(alert.alertProvider)} below {alert.collateralRatioThresh}%
    </div>
    <div className="text-th-fgd-3 text-xs mb-1 pl-6">
      Acc: {abbreviateAddress(alert.acc)}
    </div>
    <StyledStatus className="flex items-center text-th-fgd-4 pl-6">
      <span className="flex h-2 w-2 mr-1 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-th-red opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-th-red"></span>
      </span>
      Triggered{' '}
      {alert.triggeredTimestamp !== 957408447
        ? dayjs(alert.triggeredTimestamp).fromNow()
        : null}
    </StyledStatus>
  </div>
)
