import React, { FunctionComponent, useEffect, useState } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
// import Tooltip from './Tooltip'

type StyledSliderProps = {
  enableTransition?: boolean
  disabled?: boolean
}

const StyledSlider = styled(Slider)<StyledSliderProps>`
  .rc-slider-rail {
    ${tw`bg-th-bkg-3 h-2.5 rounded-full`}
  }
  .rc-slider-track {
    ${tw`bg-th-primary h-2.5 rounded-full ring-1 ring-th-primary ring-inset`}
    ${({ enableTransition }) =>
      enableTransition && tw`transition-all duration-500`}
  }
  .rc-slider-step {
    ${tw`hidden`}
  }
  .rc-slider-handle {
    ${tw`border-4 border-th-primary h-4 w-4`}
    background: #fff;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
    margin-top: -3px;
    ${({ enableTransition }) =>
      enableTransition && tw`transition-all duration-500`}
    ${({ disabled }) => disabled && tw`bg-th-fgd-3 border-th-fgd-4`}
  }
  ${({ disabled }) => disabled && 'background-color: transparent'}
`

// const getAccountStatusColor = (
//     collateralRatio: number,
//     isRisk?: boolean,
//     isStatus?: boolean
//   ) => {
//     if (collateralRatio < 1.25) {
//       return isRisk ? (
//         <div className="text-th-red">High</div>
//       ) : isStatus ? (
//         'bg-th-red'
//       ) : (
//         'border-th-red text-th-red'
//       )
//     } else if (collateralRatio > 1.25 && collateralRatio < 1.5) {
//       return isRisk ? (
//         <div className="text-th-orange">Moderate</div>
//       ) : isStatus ? (
//         'bg-th-orange'
//       ) : (
//         'border-th-orange text-th-orange'
//       )
//     } else {
//       return isRisk ? (
//         <div className="text-th-green">Low</div>
//       ) : isStatus ? (
//         'bg-th-green'
//       ) : (
//         'border-th-green text-th-green'
//       )
//     }
//   }

// const StyledSliderButtonWrapper = styled.div`
//   ${tw`absolute left-0 top-5 w-full`}
// `

// type StyledSliderButtonProps = {
//   disabled: boolean
//   styleValue: number
//   sliderValue: number
// }

// const StyledSliderButton = styled.button<StyledSliderButtonProps>`
//   ${tw`bg-none text-th-fgd-3 transition-all duration-300 hover:text-th-primary focus:outline-none`}
//   font-size: 0.65rem;
//   position: absolute;
//   display: inline-block;
//   vertical-align: middle;
//   text-align: center;
//   left: 0%;
//   :nth-of-type(2) {
//     left: 19%;
//     transform: translateX(-19%);
//   }
//   :nth-of-type(3) {
//     left: 39%;
//     transform: translateX(-39%);
//   }
//   :nth-of-type(4) {
//     left: 60%;
//     transform: translateX(-60%);
//   }
//   :nth-of-type(5) {
//     left: 80%;
//     transform: translateX(-80%);
//   }
//   :nth-of-type(6) {
//     left: 100%;
//     transform: translateX(-100%);
//   }
//   ${({ styleValue, sliderValue }) => styleValue < sliderValue && tw`opacity-40`}
//   ${({ styleValue, sliderValue }) =>
//     styleValue === sliderValue && tw`text-th-primary`}
//   ${({ disabled }) =>
//     disabled && tw`cursor-not-allowed text-th-fgd-4 hover:text-th-fgd-4`}
// `

type SliderProps = {
  onChange: (x) => void
  onAfterChange?: (x) => void
  step: number
  value: number
  disabled?: boolean
  max?: number
  maxButtonTransition?: boolean
}
//TODO maybe I can just make this an extension on the normal slider tsx?
const LeverageSlider: FunctionComponent<SliderProps> = ({
  onChange,
  onAfterChange,
  step,
  value,
  disabled,
  max,
  maxButtonTransition,
}) => {
  const [enableTransition, setEnableTransition] = useState(false)

  useEffect(() => {
    if (maxButtonTransition) {
      setEnableTransition(true)
    }
  }, [maxButtonTransition])

  useEffect(() => {
    if (enableTransition) {
      const transitionTimer = setTimeout(() => {
        setEnableTransition(false)
      }, 500)
      return () => clearTimeout(transitionTimer)
    }
  }, [enableTransition])

  // const handleSliderButtonClick = (value) => {
  //   onChange(value)
  //   setEnableTransition(true)
  // }

  return (
    <div className="relative">
      <StyledSlider
        min={0}
        max={max}
        value={value || 0}
        onChange={onChange}
        onAfterChange={onAfterChange}
        step={step}
        enableTransition={enableTransition}
        disabled={disabled}
      />
      {/* <StyledSliderButtonWrapper>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(0)}
          styleValue={0}
          sliderValue={value}
        >
          0x
        </StyledSliderButton>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(20)}
          styleValue={20}
          sliderValue={value}
        >
          1x
        </StyledSliderButton>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(40)}
          styleValue={40}
          sliderValue={value}
        >
          2x
        </StyledSliderButton>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(60)}
          styleValue={60}
          sliderValue={value}
        >
          3x
        </StyledSliderButton>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(80)}
          styleValue={80}
          sliderValue={value}
        >
          4x
        </StyledSliderButton>
        <StyledSliderButton
          disabled={disabled}
          onClick={() => handleSliderButtonClick(100)}
          styleValue={100}
          sliderValue={value}
        >
          5x
        </StyledSliderButton>
      </StyledSliderButtonWrapper> */}
      {/* Ignore the Tooltip for now */}
      {/* <Tooltip content="Projected Leverage" className="py-1">
        <span
          className={`${getAccountStatusColor( // collateral ratio
            1
          )} bg-th-bkg-1 border flex font-semibold h-10 items-center justify-center ml-2 rounded text-th-fgd-1 w-14`}
        >
          {simulation.leverage < 5
            ? simulation.leverage.toFixed(2)
            : '>5'}
          x
        </span>
      </Tooltip> */}
    </div>
  )
}

export default LeverageSlider