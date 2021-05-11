import { Fragment, FunctionComponent, ReactNode } from 'react'
import styled from '@emotion/styled'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import Tooltip from './Tooltip'

const StyledOptionsWrapper = styled.div`
  min-width: 6rem;
`

type DropMenuProps = {
  button: ReactNode
  buttonClassName?: string
  onChange: (...args: any[]) => any
  options: Array<any>
  showChevrons?: boolean
  toolTipContent?: string
  value?: any
}

const DropMenu: FunctionComponent<DropMenuProps> = ({
  button,
  buttonClassName,
  value,
  onChange,
  options,
  showChevrons,
  toolTipContent,
}) => {
  return (
    <div className={`relative`}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <Listbox.Button
              className={`${buttonClassName} default-transition focus:outline-none`}
            >
              {toolTipContent && !open ? (
                <Tooltip
                  content={toolTipContent}
                  className="flex items-center text-xs py-1"
                >
                  {button}
                  {showChevrons ? (
                    open ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )
                  ) : null}
                </Tooltip>
              ) : (
                <div className="flex items-center">
                  {button}
                  {showChevrons ? (
                    open ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : null}
                </div>
              )}
            </Listbox.Button>

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
              <StyledOptionsWrapper className="absolute z-10 mt-2 right-0 md:transform md:-translate-x-1/2 md:left-1/2 w-full">
                <Listbox.Options
                  className={`w-full bg-th-bkg-1 divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md`}
                >
                  {options.map((option) => (
                    <Listbox.Option key={option.name} value={option.name}>
                      {({ selected }) => (
                        <div
                          className={`p-2 hover:bg-th-bkg-2 hover:cursor-pointer tracking-wider ${
                            selected && `text-th-primary`
                          } ${option.icon && `flex items-center`}`}
                        >
                          {option.icon ? (
                            <div className="mr-2">{option.icon}</div>
                          ) : null}
                          {option.name}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </StyledOptionsWrapper>
            </Transition>
          </>
        )}
      </Listbox>
    </div>
  )
}

export default DropMenu
