import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { LinkIcon } from '@heroicons/react/outline'
import useMangoStore from '../stores/useMangoStore'
import { MoveIcon } from './icons'
import EmptyState from './EmptyState'

const StyledDragWrapperContent = styled.div`
  transition: all 0.25s ease-in;
  opacity: 0;
`

const StyledDragBkg = styled.div`
  transition: all 0.25s ease-in;
  opacity: 0;
`

const StyledDragWrapper = styled.div`
  :hover {
    ${StyledDragWrapperContent} {
      opacity: 1;
    }
    ${StyledDragBkg} {
      opacity: 0.9;
    }
  }
`

interface FloatingElementProps {
  className?: string
  showConnect?: boolean
}

const FloatingElement: FunctionComponent<FloatingElementProps> = ({
  className,
  children,
  showConnect,
}) => {
  const { uiLocked } = useMangoStore((s) => s.settings)
  const connected = useMangoStore((s) => s.wallet.connected)
  const wallet = useMangoStore((s) => s.wallet.current)
  return (
    <div className="m-1 p-1 bg-th-bkg-2 rounded-lg h-full">
      <div
        className={`thin-scroll p-2.5 overflow-auto overflow-x-hidden relative h-full ${className}`}
      >
        {!connected && showConnect ? (
          <div className="absolute top-0 left-0 w-full h-full z-30">
            <div className="flex flex-col h-full items-center justify-center relative z-30">
              <EmptyState
                buttonText="Connect"
                icon={<LinkIcon />}
                onClickButton={() => wallet.connect()}
                title="Connect Wallet"
              />
            </div>
            <div className="absolute top-0 left-0 rounded-lg opacity-70 w-full h-full bg-th-bkg-2" />
          </div>
        ) : null}
        {!uiLocked ? (
          <StyledDragWrapper className="absolute top-0 left-0 w-full h-full cursor-move z-50">
            <StyledDragWrapperContent className="relative flex flex-col items-center justify-center text-th-fgd-3 h-full z-50">
              <MoveIcon className="w-8 h-8" />
              <div className="mt-2">Drag to reposition</div>
            </StyledDragWrapperContent>
            <StyledDragBkg className="absolute top-0 left-0 rounded-lg w-full h-full bg-th-bkg-3" />
          </StyledDragWrapper>
        ) : null}
        {children}
      </div>
    </div>
  )
}

export default FloatingElement
