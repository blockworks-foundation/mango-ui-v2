import { useState } from 'react'
import Link from 'next/link'
import { ArrowSmDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import { useOpenOrders } from '../hooks/useOpenOrders'
import { cancelOrderAndSettle } from '../utils/mango'
import Button, { LinkButton } from './Button'
import Loading from './Loading'
import { PublicKey } from '@solana/web3.js'
import useConnection from '../hooks/useConnection'
import useMangoStore from '../stores/useMangoStore'
import { notify } from '../utils/notifications'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import SideBadge from './SideBadge'
import { useSortableData } from '../hooks/useSortableData'

const OpenOrdersTable = () => {
  const { asPath } = useRouter()
  const openOrders = useOpenOrders()
  const { items, requestSort, sortConfig } = useSortableData(openOrders)
  const [cancelId, setCancelId] = useState(null)
  const { connection, programId } = useConnection()
  const actions = useMangoStore((s) => s.actions)

  const handleCancelOrder = async (order) => {
    const wallet = useMangoStore.getState().wallet.current
    const selectedMangoGroup =
      useMangoStore.getState().selectedMangoGroup.current
    const selectedMarginAccount =
      useMangoStore.getState().selectedMarginAccount.current
    setCancelId(order?.orderId)
    try {
      if (!selectedMangoGroup || !selectedMarginAccount) return
      await cancelOrderAndSettle(
        connection,
        new PublicKey(programId),
        selectedMangoGroup,
        selectedMarginAccount,
        wallet,
        order.market,
        order
      )
      actions.fetchMarginAccounts()
    } catch (e) {
      notify({
        message: 'Error cancelling order',
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
      return
    } finally {
      setCancelId(null)
    }
  }

  return (
    <div className={`flex flex-col py-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
          {openOrders && openOrders.length > 0 ? (
            <div className={`shadow overflow-hidden border-b border-th-bkg-2`}>
              <Table className={`min-w-full divide-y divide-th-bkg-2`}>
                <Thead>
                  <Tr className="text-th-fgd-3 text-xs">
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      <LinkButton
                        className="flex items-center no-underline"
                        onClick={() => requestSort('marketName')}
                      >
                        Market
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'marketName'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      <LinkButton
                        className="flex items-center no-underline"
                        onClick={() => requestSort('side')}
                      >
                        Side
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'side'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      <LinkButton
                        className="flex items-center no-underline"
                        onClick={() => requestSort('size')}
                      >
                        Size
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'size'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
                    </Th>
                    <Th
                      scope="col"
                      className={`px-6 py-3 text-left font-normal`}
                    >
                      <LinkButton
                        className="flex items-center no-underline"
                        onClick={() => requestSort('price')}
                      >
                        Price
                        <ArrowSmDownIcon
                          className={`default-transition flex-shrink-0 h-4 w-4 ml-1 ${
                            sortConfig?.key === 'price'
                              ? sortConfig.direction === 'ascending'
                                ? 'transform rotate-180'
                                : 'transform rotate-360'
                              : null
                          }`}
                        />
                      </LinkButton>
                    </Th>
                    <Th scope="col" className={`relative px-6 py-3`}>
                      <span className={`sr-only`}>Edit</span>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((order, index) => (
                    <Tr
                      key={`${order.orderId}${order.side}`}
                      className={`border-b border-th-bkg-3
                        ${index % 2 === 0 ? `bg-th-bkg-3` : `bg-th-bkg-2`}
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
                            src={`/assets/icons/${order.marketName
                              .split('/')[0]
                              .toLowerCase()}.svg`}
                            className={`mr-2.5`}
                          />
                          <div>{order.marketName}</div>
                        </div>
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        <SideBadge side={order.side} />
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {order.size}
                      </Td>
                      <Td
                        className={`px-6 py-3 whitespace-nowrap text-sm text-th-fgd-1`}
                      >
                        {order.price}
                      </Td>
                      <Td className={`px-6 py-3 whitespace-nowrap text-left`}>
                        <div className={`flex justify-end`}>
                          {/* Todo: support order modification */}
                          {/* <Button
                            onClick={() =>
                              console.log('trigger modify order modal')
                            }
                            className={`text-xs pt-0 pb-0 h-8 pl-3 pr-3`}
                          >
                            Modify
                          </Button> */}
                          <Button
                            onClick={() => handleCancelOrder(order)}
                            className={`ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3`}
                          >
                            {cancelId + '' === order?.orderId + '' ? (
                              <Loading />
                            ) : (
                              <span>Cancel</span>
                            )}
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          ) : (
            <div
              className={`w-full text-center py-6 bg-th-bkg-1 text-th-fgd-3 rounded-md`}
            >
              No open orders.
              {asPath === '/account' ? (
                <Link href={'/'}>
                  <a
                    className={`inline-flex ml-2 py-0
        `}
                  >
                    Make a trade
                  </a>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OpenOrdersTable
