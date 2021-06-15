import { useEffect, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'

const useDepositHistory = () => {
  const [depositHistory, setDepositHistory] = useState<any>(null)
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )

  useEffect(() => {
    if (!selectedMarginAccount) return

    const fetchHistory = async () => {
      const response = await fetch(
        `https://serumtaxtime.com/stats/deposits/${selectedMarginAccount.publicKey.toString()}`
      )
      const history = await response.json()
      setDepositHistory(history)
    }
    fetchHistory()
  }, [selectedMarginAccount])

  return { depositHistory }
}

export default useDepositHistory
