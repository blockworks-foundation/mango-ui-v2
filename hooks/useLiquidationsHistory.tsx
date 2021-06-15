import { useEffect, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'

const useLiquidationsHistory = () => {
  const [liquidationsHistory, setLiquidationsHistory] = useState<any>(null)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  useEffect(() => {
    if (!selectedMarginAccount) return

    const fetchHistory = async () => {
      const response = await fetch(
        `https://serumtaxtime.com/stats/liquidations/${selectedMarginAccount.publicKey.toString()}`
      )
      const history = await response.json()
      setLiquidationsHistory(history)
    }
    fetchHistory()
  }, [selectedMarginAccount])

  return { liquidationsHistory }
}

export default useLiquidationsHistory
