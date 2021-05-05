import { FunctionComponent } from 'react'
import dayjs from 'dayjs'
import styled from '@emotion/styled'
import { DeviceMobileIcon, MailIcon } from '@heroicons/react/outline'
import { TelegramIcon } from './icons'
import { abbreviateAddress } from '../utils'

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const StyledDiv = styled.div`
  font-size: 0.75rem;
`

interface AlertItemProps {
  alert: {
    alertProvider: string
    collateralRatioThresh: string
    timestamp: number
    open: boolean
    acc?: any
    triggeredTimestamp?: number
  }
  isLarge?: boolean
}

const AlertItem: FunctionComponent<AlertItemProps> = ({
  alert,
  isLarge = false,
}) => {
  return (
    <div className="border border-th-bkg-3 mb-2 p-3 rounded-lg">
      <div className="flex">
        {alert.alertProvider === 'sms' ? (
          <DeviceMobileIcon
            className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4 mt-0.5'} mr-2`}
          />
        ) : alert.alertProvider === 'mail' ? (
          <MailIcon
            className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4 mt-0.5'} mr-2`}
          />
        ) : (
          <TelegramIcon
            className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4 mt-0.5'} mr-2`}
          />
        )}
        <div className="w-full">
          <div className="flex justify-between pb-1">
            {alert.alertProvider === 'sms'
              ? 'SMS'
              : alert.alertProvider === 'mail'
              ? 'E-mail'
              : 'Telegram'}{' '}
            below {alert.collateralRatioThresh}%
            {isLarge ? (
              <div className="text-xs text-th-fgd-4">
                {dayjs(alert.timestamp).fromNow()}
              </div>
            ) : null}
          </div>
          <div className="text-th-fgd-3 text-xs mb-1">
            Acc: {abbreviateAddress(alert.acc)}
          </div>
          {alert.open ? (
            <StyledDiv className="flex items-center text-th-fgd-4">
              <span className="flex h-2 w-2 mr-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-th-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-th-green"></span>
              </span>
              Active
            </StyledDiv>
          ) : (
            <StyledDiv className="flex items-center text-th-fgd-4">
              <span className="flex h-2 w-2 mr-1.5 relative">
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
      </div>
    </div>
  )
}

export default AlertItem
