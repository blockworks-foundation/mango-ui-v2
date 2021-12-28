import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from '../charting_library' // Make sure to follow step 1 of the README
// import { useMarket } from '../../utils/markets';
import { CHART_DATA_FEED } from '../../utils/chartDataConnector'
import useMangoStore from '../../stores/useMangoStore'

// This is a basic example of how to create a TV widget
// You can add more feature such as storing charts in localStorage

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

// export interface ChartContainerState {}

const TVChartContainer = () => {
  const selectedMarketName = useMangoStore((s) => s.selectedMarket.name)
  const { theme } = useTheme()

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

  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  // TODO: fetch market from store and wire up to chart
  // const { market, marketName } = useMarket()

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

    tvWidget.onChartReady(() => {
      // tvWidget.headerReady().then(() => {
      // const button = tvWidget.createButton()
      // button.setAttribute('title', 'Click to show a notification popup')
      // button.classList.add('apply-common-tooltip')
      // button.addEventListener('click', () =>
      //   tvWidget.showNoticeDialog({
      //     title: 'Notification',
      //     body: 'TradingView Charting Library API works correctly',
      //     callback: () => {
      //       // console.log('It works!!');
      //     },
      //   })
      // )
      // button.innerHTML = 'Check API'
      // })
    })
    //eslint-disable-next-line
  }, [selectedMarketName, theme])

  // TODO: add market back to dep array
  // }, [market])

  return <div id={defaultProps.containerId} className="tradingview-chart" />
}

export default TVChartContainer
