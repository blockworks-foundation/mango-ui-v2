import { useEffect, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'

const useWithdrawalHistory = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState<any>(null)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  useEffect(() => {
    if (!selectedMarginAccount) return

    const fetchHistory = async () => {
      const response = await fetch(
        `https://serumtaxtime.com/stats/withdraws/${selectedMarginAccount.publicKey.toString()}`
      )
      const history = await response.json()
      setWithdrawalHistory(history)
    }
    fetchHistory()
  }, [selectedMarginAccount])

  return { withdrawalHistory }
}

export default useWithdrawalHistory
