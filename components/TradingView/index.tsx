import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from '../charting_library' // Make sure to follow step 1 of the README
import { CHART_DATA_FEED } from '../../utils/chartDataConnector'
import useMangoStore from '../../stores/useMangoStore'
import { useOpenOrders } from '../../hooks/useOpenOrders'
import { useSortableData } from '../../hooks/useSortableData'
import { PublicKey } from '@solana/web3.js'
import useConnection from '../../hooks/useConnection'
import { cancelOrderAndSettle, modifyOrderAndSettle } from '../../utils/mango'
import { notify } from '../../utils/notifications'

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  datafeedUrl: string
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  containerId: ChartingLibraryWidgetOptions['container_id']
  theme: string
}

const TVChartContainer = () => {
  const selectedMarketName = useMangoStore((s) => s.selectedMarket.name)
  const { theme } = useTheme()
  const openOrders = useOpenOrders()
  const { items } = useSortableData(openOrders)

  const { connection, programId } = useConnection()
  const actions = useMangoStore((s) => s.actions)
  const connected = useMangoStore((s) => s.wallet.connected)
  const selectedMarginAccount =
    useMangoStore.getState().selectedMarginAccount.current
  const selectedMarketPrice = useMangoStore((s) => s.selectedMarket.markPrice)
  const [lines, setLines] = useState(new Map())
  const [moveInProgress, toggleMoveInProgress] = useState(false)

  // @ts-ignore
  const defaultProps: ChartContainerProps = {
    symbol: selectedMarketName,
    interval: '60' as ResolutionString,
    theme: 'Dark',
    containerId: 'tv_chart_container',
    datafeedUrl: CHART_DATA_FEED,
    libraryPath: '/charting_library/',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {
      'volume.volume.color.0': theme === 'Mango' ? '#E54033' : '#CC2929',
      'volume.volume.color.1': theme === 'Mango' ? '#AFD803' : '#5EBF4D',
    },
  }

  const handleChangeOrder = async (order, newPrice) => {
    const wallet = useMangoStore.getState().wallet.current
    const selectedMangoGroup =
      useMangoStore.getState().selectedMangoGroup.current

    try {
      if (!selectedMangoGroup || !selectedMarginAccount) return
      await modifyOrderAndSettle(
        connection,
        new PublicKey(programId),
        selectedMangoGroup,
        selectedMarginAccount,
        wallet,
        order.market,
        order,
        order.side,
        newPrice,
        order.size,
        'limit'
      )
      actions.fetchMarginAccounts()
      return true
    } catch (e) {
      notify({
        message: 'Error cancelling order',
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
      return false
    }
  }

  const handleCancelOrder = async (order) => {
    const wallet = useMangoStore.getState().wallet.current
    const selectedMangoGroup =
      useMangoStore.getState().selectedMangoGroup.current

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
      return true
    } catch (e) {
      notify({
        message: 'Error cancelling order',
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
      return false
    }
  }

  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: selectedMarketName,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        defaultProps.datafeedUrl
      ),
      interval:
        defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
      container_id:
        defaultProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: defaultProps.libraryPath as string,
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
        'timeframes_toolbar',
        // 'volume_force_overlay',
        // 'left_toolbar',
        'show_logo_on_all_charts',
        'caption_buttons_text_if_possible',
        'header_settings',
        'header_chart_type',
        'header_compare',
        'compare_symbol',
        'header_screenshot',
        // 'header_widget_dom_node',
        'header_saveload',
        'header_undo_redo',
        'header_interval_dialog_button',
        'show_interval_dialog_on_key_press',
        'header_symbol_search',
        // 'header_resolutions',
        // 'header_widget',
      ],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: theme === 'Light' ? 'Light' : 'Dark',
      custom_css_url: '/tradingview-chart.css',
      loading_screen: { backgroundColor: 'rgba(0,0,0,0.1)' },
      overrides: {
        'paneProperties.background':
          theme === 'Dark' ? '#2B2B2B' : theme === 'Light' ? '#fff' : '#1D1832',
        'mainSeriesProperties.candleStyle.upColor':
          theme === 'Mango' ? '#AFD803' : '#5EBF4D',
        'mainSeriesProperties.candleStyle.downColor':
          theme === 'Mango' ? '#E54033' : '#CC2929',
        'mainSeriesProperties.candleStyle.drawWick': true,
        'mainSeriesProperties.candleStyle.drawBorder': true,
        'mainSeriesProperties.candleStyle.borderColor':
          theme === 'Mango' ? '#AFD803' : '#5EBF4D',
        'mainSeriesProperties.candleStyle.borderUpColor':
          theme === 'Mango' ? '#AFD803' : '#5EBF4D',
        'mainSeriesProperties.candleStyle.borderDownColor':
          theme === 'Mango' ? '#E54033' : '#CC2929',
        'mainSeriesProperties.candleStyle.wickUpColor':
          theme === 'Mango' ? '#AFD803' : '#5EBF4D',
        'mainSeriesProperties.candleStyle.wickDownColor':
          theme === 'Mango' ? '#E54033' : '#CC2929',
      },
    }

    const tvWidget = new widget(widgetOptions)
    tvWidgetRef.current = tvWidget
  }, [selectedMarketName, theme])

  function getLine(order) {
    return tvWidgetRef.current
      .chart()
      .createOrderLine({ disableUndo: false })
      .onMove(function () {
        this.setPrice(this.getPrice())
        const currentOrderPrice = order.price
        const updatedOrderPrice = this.getPrice()

        if (
          (order.side === 'buy' &&
            updatedOrderPrice > 1.05 * selectedMarketPrice) ||
          (order.side === 'sell' &&
            updatedOrderPrice < 0.95 * selectedMarketPrice)
        ) {
          toggleMoveInProgress(true)
          tvWidgetRef.current.showNoticeDialog({
            title: 'Order Price Outside Range',
            body:
              `Your order price ($${updatedOrderPrice.toFixed(
                2
              )}) is greater than 5% ${
                order.side == 'buy' ? 'above' : 'below'
              } the current market price ($${selectedMarketPrice.toFixed(
                2
              )}). ` +
              ' indicating you might incur significant slippage. <p><p>Please use the trade input form if you wish to accept the potential slippage.',
            callback: () => {
              this.setPrice(currentOrderPrice)
              toggleMoveInProgress(false)
            },
          })
        } else {
          toggleMoveInProgress(true)
          tvWidgetRef.current.showConfirmDialog({
            title: 'Change Order Price?',
            body: `Would you like to change your order from a 
           ${order.size} ${order.marketName.split('/')[0].toUpperCase()} ${
              order.side
            } at $${currentOrderPrice} 
           to a 
          ${order.size} ${order.marketName.split('/')[0].toUpperCase()} ${
              order.side
            } at $${updatedOrderPrice}? Current market price is ${selectedMarketPrice} 
          `,
            callback: (res) => {
              if (res) {
                handleChangeOrder(order, updatedOrderPrice).then((result) => {
                  if (!result) {
                    this.setPrice(currentOrderPrice)
                  }
                })
              } else {
                this.setPrice(currentOrderPrice)
              }
              toggleMoveInProgress(false)
            },
          })
        }
      })
      .onCancel(function () {
        toggleMoveInProgress(true)
        tvWidgetRef.current.showConfirmDialog({
          title: 'Cancel Your Order?',
          body: `Would you like to cancel your order for 
       ${order.size} ${order.marketName.split('/')[0].toUpperCase()} ${
            order.side
          } at $${order.price}  
      `,
          callback: (res) => {
            if (res) {
              handleCancelOrder(order)
            }
            toggleMoveInProgress(false)
          },
        })
      })
      .setText(
        `${order.side.toUpperCase()} ${order.marketName
          .split('/')[0]
          .toUpperCase()}`
      )
      .setBodyBorderColor(order.side == 'buy' ? '#AFD803' : '#E54033')
      .setBodyBackgroundColor('#000000')
      .setBodyTextColor('#F2C94C')
      .setLineLength(3)
      .setLineColor(order.side == 'buy' ? '#AFD803' : '#E54033')
      .setQuantity(order.size)
      .setTooltip(`Order #: ${order.orderId}`)
      .setQuantityBorderColor(order.side == 'buy' ? '#AFD803' : '#E54033')
      .setQuantityBackgroundColor('#000000')
      .setQuantityTextColor('#F2C94C')
      .setCancelButtonBorderColor(order.side == 'buy' ? '#AFD803' : '#E54033')
      .setCancelButtonBackgroundColor('#000000')
      .setCancelButtonIconColor('#F2C94C')
      .setPrice(order.price)
  }

  useEffect(() => {
    if (!moveInProgress) {
      const tempLines = new Map()
      tvWidgetRef.current.onChartReady(() => {
        if (lines.size > 0) {
          lines.forEach((value, key) => {
            lines.get(key).remove()
          })
        }

        items.map((order) => {
          if (order.marketName == selectedMarketName) {
            tempLines.set(order.orderId.toString(), getLine(order))
          }
        })
      })
      setLines(tempLines)
    }
  }, [
    selectedMarginAccount,
    connected,
    selectedMarketName,
    selectedMarketPrice,
  ])

  return <div id={defaultProps.containerId} className="tradingview-chart" />
}

export default TVChartContainer
