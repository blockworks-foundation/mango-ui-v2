import { useCallback, useState } from 'react'
import numeral from 'numeral'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { RadioGroup } from '@headlessui/react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../stores/useMangoStore'
import useMarketList from '../hooks/useMarketList'
import {
  abbreviateAddress,
  floorToDecimal,
  tokenPrecision,
} from '../utils/index'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import Button from './Button'
import Tooltip from './Tooltip'
import { WalletIcon } from './icons'
import { MarginAccount } from '@blockworks-foundation/mango-client'

export default function MarginBalances() {
  const setMangoStore = useMangoStore((s) => s.set)
  const marginAccounts = useMangoStore((s) => s.marginAccounts)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)
  const { symbols } = useMarketList()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
  }, [])

  const handleCloseWithdraw = useCallback(() => {
    setShowWithdrawModal(false)
  }, [])

  const handleMarginAccountChange = (marginAccount: MarginAccount) => {
    setMangoStore((state) => {
      state.selectedMarginAccount.current = marginAccount
    })
  }

  return (
    <div className="bg-th-bkg-2 flex grid grid-cols-12 gap-4 md:px-9 py-6">
      {marginAccounts.length > 1 ? (
        <div className="col-span-2">
          <RadioGroup
            value={selectedMarginAccount}
            onChange={(acc) => handleMarginAccountChange(acc)}
          >
            <RadioGroup.Label className="sr-only">
              Margin account
            </RadioGroup.Label>
            <div className="space-y-2">
              {marginAccounts.map((account, i) => (
                <RadioGroup.Option
                  key={account.publicKey.toString()}
                  value={account}
                  className={({ active, checked }) =>
                    `${checked ? 'bg-th-bkg-3' : 'bg-th-bkg-1'}
                      relative rounded-md w-full px-3 py-3 cursor-pointer default-transition flex hover:bg-th-bkg-3 focus:outline-none`
                  }
                >
                  {({ active, checked }) => (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <RadioGroup.Label
                              as="span"
                              className="flex items-center text-th-fgd-1"
                            >
                              <WalletIcon className="h-4 w-4 fill-current mr-2" />
                              Account {i + 1}
                            </RadioGroup.Label>
                          </div>
                        </div>
                        {checked && (
                          <div className="flex-shrink-0 text-th-green">
                            <CheckCircleIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>
      ) : null}
      <div className="col-span-10">
        <div className="bg-th-bkg-1 flex grid grid-cols-12 gap-4 items-center justify-between mb-4 px-4 py-3 rounded-md">
          {/* <div className="flex"> */}
          <div className="col-span-2">
            <div className={`text-th-fgd-4 text-xs`}>Address</div>
            <div className="font-semibold text-lg">
              {abbreviateAddress(selectedMarginAccount.publicKey)}
            </div>
          </div>
          <div className="border-l border-th-bkg-3 col-span-2 pl-3">
            <div className={`text-th-fgd-4 text-xs`}>Value</div>
            <div className="font-semibold text-lg">
              ${numeral(12345.6).format('0,0.0')}
            </div>
          </div>
          <div className="border-l border-th-bkg-3 col-span-2 pl-3">
            <div className={`text-th-fgd-4 text-xs`}>Total PNL</div>
            <div className="font-semibold text-lg">
              ${numeral(9876.4).format('0,0.0')}
            </div>
          </div>
          {/* </div> */}
          <div className={`col-span-6 flex items-center justify-end`}>
            <Button
              className="text-xs flex items-center justify-center pt-0 pb-0 h-8 px-3"
              disabled={!connected || loadingMarginAccount}
              onClick={() => setShowDepositModal(true)}
            >
              Deposit
            </Button>
            <Button
              className="text-xs flex items-center justify-center sm:ml-2 pt-0 pb-0 h-8 px-3"
              disabled={
                !connected || !selectedMarginAccount || loadingMarginAccount
              }
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </Button>
            <Button
              className="text-xs flex items-center justify-center sm:ml-2 pt-0 pb-0 h-8 px-3"
              disabled={
                !connected || !selectedMarginAccount || loadingMarginAccount
              }
              onClick={() => setShowWithdrawModal(true)}
            >
              Settle All
            </Button>
          </div>
        </div>
        {selectedMangoGroup ? (
          <Table className="w-full">
            <Thead>
              <Tr className={`text-th-fgd-3 text-xs`}>
                <Th scope="col" className={`px-4 py-3 text-left font-normal`}>
                  Assets
                </Th>
                <Th scope="col" className={`px-4 py-3 text-left font-normal`}>
                  Deposits
                </Th>
                <Th scope="col" className={`px-4 py-3 text-left font-normal`}>
                  Borrows
                </Th>
                <Th scope="col" className={`px-4 py-3 text-left font-normal`}>
                  Unsettled
                </Th>
                <Th scope="col" className="px-4 py-3 text-left font-normal">
                  Deposit APR
                </Th>
                <Th scope="col" className="px-4 py-3 text-left font-normal">
                  Borrow APY
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(symbols).map(([name], i) => (
                <Tr
                  key={name}
                  className={`border-b border-th-bkg-3
                  ${i % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                `}
                >
                  <Td
                    className={`flex px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <img
                      alt=""
                      width="20"
                      height="20"
                      src={`/assets/icons/${name.toLowerCase()}.svg`}
                      className={`mr-2.5`}
                    />
                    <span>{name}</span>
                  </Td>
                  <Td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    {selectedMarginAccount
                      ? floorToDecimal(
                          selectedMarginAccount.getUiDeposit(
                            selectedMangoGroup,
                            i
                          ),
                          tokenPrecision[name]
                        ).toFixed(tokenPrecision[name])
                      : (0).toFixed(tokenPrecision[name])}
                  </Td>
                  <Td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    {selectedMarginAccount
                      ? selectedMarginAccount
                          .getUiBorrow(selectedMangoGroup, i)
                          .toFixed(tokenPrecision[name])
                      : (0).toFixed(tokenPrecision[name])}
                  </Td>
                  <Td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    {(0.0).toFixed(tokenPrecision[name])}
                  </Td>
                  <Td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <span className={`text-th-green`}>
                      {(selectedMangoGroup.getDepositRate(i) * 100).toFixed(2)}%
                    </span>
                  </Td>
                  <Td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <span className={`text-th-red`}>
                      {(selectedMangoGroup.getBorrowRate(i) * 100).toFixed(2)}%
                    </span>
                  </Td>
                  <Td className={`px-4 text-right`}>
                    <Button
                      className="inline-block text-xs items-center justify-center pt-0 pb-0 h-8 px-3"
                      disabled={!connected || loadingMarginAccount}
                      onClick={() => setShowDepositModal(true)}
                    >
                      Settle
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : null}
      </div>
      {showDepositModal && (
        <DepositModal isOpen={showDepositModal} onClose={handleCloseDeposit} />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={handleCloseWithdraw}
        />
      )}
    </div>
  )
}

const AddressTooltip = ({
  owner,
  marginAccount,
}: {
  owner?: string
  marginAccount?: string
}) => {
  return (
    <>
      {owner && marginAccount ? (
        <>
          <div className={`flex flex-nowrap text-th-fgd-3`}>
            Margin Account:
            <a
              className="text-th-fgd-1 default-transition hover:text-th-primary"
              href={'https://explorer.solana.com/address/' + marginAccount}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={`ml-2 flex items-center`}>
                <span className={`underline`}>
                  {marginAccount.toString().substr(0, 5) +
                    '...' +
                    marginAccount.toString().substr(-5)}
                </span>
                <ExternalLinkIcon className={`h-4 w-4 ml-1`} />
              </div>
            </a>
          </div>
          <div className={`flex flex-nowrap text-th-fgd-3 pt-2`}>
            Account Owner:
            <a
              className="text-th-fgd-1 default-transition hover:text-th-primary"
              href={'https://explorer.solana.com/address/' + owner}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={`ml-2 flex items-center`}>
                <span className={`underline`}>
                  {owner.toString().substr(0, 5) +
                    '...' +
                    owner.toString().substr(-5)}
                </span>
                <ExternalLinkIcon className={`h-4 w-4 ml-1`} />
              </div>
            </a>
          </div>
        </>
      ) : (
        'Connect a wallet and deposit funds to start trading'
      )}
    </>
  )
}
