import React, { FunctionComponent } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'

type LeverageIndicatorProps = {
  leverage: number
  long: number
}

const StyledLeverageIndicatorWrapper = styled.div`
  ${tw`w-11/12 m-auto pt-2 -mb-4`}
`

const StyledLeverageNumber = styled.div`
  ${tw`flex justify-center`}
`

const StyledLeverageArrow = styled.div`
  ${tw`relative`}
`

type StyledLeverageIndicatorProps = {
  leverage: number
}
  
const LeverageIndicator: FunctionComponent<LeverageIndicatorProps> = ({ leverage, long }) => {
  const side = long === 1 ? 'long' : 'short'
  const IndicatorPosition = `${leverage*10*long + 50}%`
  return (
    <div>
      <StyledLeverageIndicatorWrapper>
        <StyledLeverageNumber>
          CURRENT LEVERAGE: {leverage.toFixed(2)}x {side}
        </StyledLeverageNumber>
        <StyledLeverageArrow style={{left: IndicatorPosition}}>
          ↓
        </StyledLeverageArrow>
      </StyledLeverageIndicatorWrapper>
    </div>
  )
          {/* <StyledLeverageIndicatorWrapper>
          
        </StyledLeverageIndicatorWrapper> */}
}

export default LeverageIndicator