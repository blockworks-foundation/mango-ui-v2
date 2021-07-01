import { RefreshIcon } from '@heroicons/react/outline'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import useMangoStore from '../stores/useMangoStore'
// import { useBalances } from '../hooks/useBalances'
import useMarketList from '../hooks/useMarketList'
import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'
import Button, { LinkButton } from '../components/Button'
import Input from '../components/Input'
import Slider from '../components/Slider'

export default function LiquidationCalculator() {
  // const balances = useBalances()
  const prices = useMangoStore((s) => s.selectedMangoGroup.prices)
  const { symbols } = useMarketList()

  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row sm:justify-between pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Liquidation Calculator
          </h1>
        </div>
        {prices.length > 0 ? (
          <div className="rounded-lg bg-th-bkg-2">
            <div className="grid grid-cols-12">
              <div className="col-span-9 p-4">
                <div className="flex items-start justify-between pb-8 px-3">
                  <div className="text-th-fgd-1 text-lg">Balances</div>
                  <div className="flex">
                    <div className="bg-th-bkg-1 border border-th-fgd-4 flex items-center px-3 h-8 rounded">
                      <div className="pr-4 text-th-fgd-3 text-xs">
                        Edit All Prices
                      </div>
                      <div className="-mt-1.5 w-32">
                        <Slider
                          hideButtons
                          onChange={() =>
                            console.log('adjust all prices by percentage')
                          }
                          step={1}
                          value={50}
                        />
                      </div>
                      <div className="pl-4 text-th-fgd-1 text-xs">0%</div>
                    </div>
                    <Button
                      className={`text-xs flex items-center justify-center sm:ml-3 pt-0 pb-0 h-8 pl-3 pr-3 rounded`}
                      onClick={() => console.log('Reset back to defaults')}
                    >
                      <div className="flex items-center">
                        <RefreshIcon className="h-5 w-5 mr-1.5" />
                        Reset
                      </div>
                    </Button>
                  </div>
                </div>
                <div className={`flex flex-col pb-2`}>
                  <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
                    <div
                      className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}
                    >
                      <Table className="min-w-full divide-y divide-th-bkg-2">
                        <Thead>
                          <Tr className="text-th-fgd-3 text-xs">
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              Asset
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-between">
                                Deposits
                                <LinkButton>Reset</LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              <div className="flex justify-between">
                                Borrows
                                <LinkButton>Reset</LinkButton>
                              </div>
                            </Th>
                            <Th scope="col" className={`px-3 py-1 font-normal`}>
                              <div className="flex justify-between">
                                Price
                                <LinkButton>Reset</LinkButton>
                              </div>
                            </Th>
                            <Th
                              scope="col"
                              className={`px-3 py-1 text-left font-normal`}
                            >
                              Collateral Weight
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {Object.entries(symbols).map(([name], i) => (
                            <Tr key={`${i}`}>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <div className="flex items-center">
                                  <img
                                    alt=""
                                    width="20"
                                    height="20"
                                    src={`/assets/icons/${name.toLowerCase()}.svg`}
                                    className={`mr-2.5`}
                                  />
                                  <div>{name}</div>
                                </div>
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={0}
                                  onChange={() =>
                                    console.log('Change deposits')
                                  }
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="number"
                                  value={0}
                                  onChange={() => console.log('Change borrows')}
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="text"
                                  value={`$${prices[i].toLocaleString()}`}
                                  onChange={() => console.log('Change price')}
                                />
                              </Td>
                              <Td
                                className={`px-3 py-2 whitespace-nowrap text-sm text-th-fgd-1`}
                              >
                                <Input
                                  type="text"
                                  value={'$0'}
                                  onChange={() =>
                                    console.log('Should this be editable?')
                                  }
                                  disabled
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-th-bkg-3 col-span-3 p-4 rounded-r-lg">
                <div className="pb-4 text-th-fgd-1 text-lg">Details</div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Equity</div>
                  <div className="font-bold">$XXX</div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Assets Value</div>
                  <div className="font-bold">$XXX</div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Liabilities Value</div>
                  <div className="font-bold">$XXX</div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Leverage</div>
                  <div className="font-bold">X.XXx</div>
                </div>
                <div className="flex items-center justify-between pb-3">
                  <div className="text-th-fgd-3">Collateral Ratio</div>
                  <div className="font-bold">XXX%</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageBodyContainer>
    </div>
  )
}
