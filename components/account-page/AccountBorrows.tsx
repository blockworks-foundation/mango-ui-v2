import { useCallback, useState } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useConnection from '../../hooks/useConnection'
import useMangoStore from '../../stores/useMangoStore'
import useMarketList from '../../hooks/useMarketList'
import { notify } from '../../utils/notifications'
import { sleep } from '../../utils'
import { PublicKey } from '@solana/web3.js'
import { floorToDecimal, tokenPrecision } from '../../utils/index'
import { settleBorrow } from '../../utils/mango'
import BorrowModal from '../BorrowModal'
import Button from '../Button'

export default function AccountAssets() {
  const { programId, connection } = useConnection()
  const actions = useMangoStore((s) => s.actions)
  const selectedMangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const loadingMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.initialLoad
  )
  const connected = useMangoStore((s) => s.wallet.connected)
  const { symbols } = useMarketList()

  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)

  const [borrowSymbol, setBorrowSymbol] = useState('')
  const [showBorrowModal, setShowBorrowModal] = useState(false)

  async function handleSettleBorrow(token, quantity) {
    const marginAccount = useMangoStore.getState().selectedMarginAccount.current
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current
    const wallet = useMangoStore.getState().wallet.current

    try {
      await settleBorrow(
        connection,
        new PublicKey(programId),
        mangoGroup,
        marginAccount,
        wallet,
        new PublicKey(symbols[token]),
        Number(quantity)
      )
      await sleep(250)
      actions.fetchMarginAccounts()
    } catch (e) {
      console.warn('Error settling all:', e)
      if (e.message === 'No unsettled borrows') {
        notify({
          message: 'There are no unsettled borrows',
          type: 'error',
        })
      } else {
        notify({
          message: 'Error settling borrows',
          description: e.message,
          txid: e.txid,
          type: 'error',
        })
      }
    }
  }

  const handleCloseWithdraw = useCallback(() => {
    setShowBorrowModal(false)
  }, [])

  const handleShowBorrow = (symbol) => {
    setBorrowSymbol(symbol)
    setShowBorrowModal(true)
  }

  // get the sum of all borrows
  const getAccountBorrowValue = () =>
    Object.entries(symbols)
      .map(
        ([name], i) =>
          floorToDecimal(
            selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
            tokenPrecision[name]
          ) * prices[i]
      )
      .reduce((a, b) => a + b, 0)
      .toFixed(2)

  // get assets that already have borrow
  const getAccountBorrows = () =>
    Object.entries(symbols)
      .map(([name], i) => {
        return {
          name: name,
          bal: selectedMarginAccount.getUiBorrow(selectedMangoGroup, i),
          index: i,
        }
      })
      .filter((bal) => bal.bal > 0)

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between pb-4">
        <div className="pb-2 sm:pb-0 text-th-fgd-1 text-lg">Your Borrows</div>
        <div className="border border-th-red flex items-center justify-between p-2 rounded">
          <div className="pr-4 text-xs text-th-fgd-3">Total Borrow Value:</div>
          <span>${getAccountBorrowValue()}</span>
        </div>
      </div>
      {selectedMangoGroup ? (
        getAccountBorrows().length > 0 ? (
          <Table className="min-w-full divide-y divide-th-bkg-2">
            <Thead>
              <Tr className="text-th-fgd-3 text-xs">
                <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                  Asset
                </Th>
                <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                  Balance
                </Th>
                <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
                  Value
                </Th>
                <Th scope="col" className="px-6 py-3 text-left font-normal">
                  Interest APY
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {getAccountBorrows().map((asset, i) => (
                <Tr
                  key={`${i}`}
                  className={`border-b border-th-bkg-3
                  ${i % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                `}
                >
                  <Td
                    className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <div className="flex items-center">
                      <img
                        alt=""
                        width="20"
                        height="20"
                        src={`/assets/icons/${asset.name.toLowerCase()}.svg`}
                        className={`mr-2.5`}
                      />
                      <div>{asset.name}</div>
                    </div>
                  </Td>
                  <Td
                    className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    {asset.bal.toFixed(tokenPrecision[asset.name])}
                  </Td>
                  <Td
                    className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    $
                    {(asset.bal * prices[asset.index]).toFixed(
                      tokenPrecision[asset.name]
                    )}
                  </Td>
                  <Td
                    className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <span className={`text-th-green`}>
                      {(
                        selectedMangoGroup.getBorrowRate(asset.index) * 100
                      ).toFixed(2)}
                      %
                    </span>
                  </Td>
                  <Td
                    className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                  >
                    <div className={`flex justify-end`}>
                      <Button
                        onClick={() =>
                          handleSettleBorrow(asset.name, asset.bal)
                        }
                        className="text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                        disabled={
                          !connected ||
                          !selectedMarginAccount ||
                          loadingMarginAccount
                        }
                      >
                        Settle
                      </Button>
                      <Button
                        onClick={() => handleShowBorrow(asset)}
                        className="ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                        disabled={!connected || loadingMarginAccount}
                      >
                        Borrow
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <div
            className={`w-full text-center py-6 bg-th-bkg-1 text-th-fgd-3 rounded-md`}
          >
            No borrows found.
          </div>
        )
      ) : null}
      <div className="pb-2 pt-8 text-th-fgd-1 text-lg">Available Assets</div>
      <Table className="min-w-full divide-y divide-th-bkg-2">
        <Thead>
          <Tr className="text-th-fgd-3 text-xs">
            <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
              Asset
            </Th>
            <Th scope="col" className={`px-6 py-3 text-left font-normal`}>
              Price
            </Th>
            <Th scope="col" className="px-6 py-3 text-left font-normal">
              Interest APY
            </Th>
            <Th scope="col" className="px-6 py-3 text-left font-normal">
              Available Liquidity
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(symbols).map(([asset], i) => (
            <Tr
              key={`${i}`}
              className={`border-b border-th-bkg-3
                  ${i % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
                `}
            >
              <Td
                className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
              >
                <div className="flex items-center">
                  <img
                    alt=""
                    width="20"
                    height="20"
                    src={`/assets/icons/${asset.toLowerCase()}.svg`}
                    className={`mr-2.5`}
                  />
                  <div>{asset}</div>
                </div>
              </Td>
              <Td
                className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
              >
                ${prices[i]}
              </Td>
              <Td
                className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
              >
                <span className={`text-th-green`}>
                  {(selectedMangoGroup.getBorrowRate(i) * 100).toFixed(2)}%
                </span>
              </Td>
              <Td
                className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
              >
                {selectedMangoGroup
                  .getUiTotalDeposit(i)
                  .toFixed(tokenPrecision[asset])}
              </Td>
              <Td
                className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
              >
                <div className={`flex justify-end`}>
                  <Button
                    onClick={() => handleShowBorrow(asset)}
                    className="text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                    disabled={!connected || loadingMarginAccount}
                  >
                    Borrow
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {showBorrowModal && (
        <BorrowModal
          isOpen={showBorrowModal}
          onClose={handleCloseWithdraw}
          tokenSymbol={borrowSymbol}
        />
      )}
    </>
  )
}
