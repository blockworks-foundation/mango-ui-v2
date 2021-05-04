import { useMemo, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import { notify } from '../utils/notifications'

export default function useAlerts() {
  const marginAccounts = useMangoStore((s) => s.marginAccounts)

  const [alerts, setAlerts] = useState([])
  const [loadAlerts, setLoadAlerts] = useState(true)

  useMemo(() => {
    const getAlerts = async () => {
      if (marginAccounts.length > 0) {
        if (marginAccounts.length === 1) {
          const headers = { 'Content-Type': 'application/json' }
          const response = await fetch(
            `https://mango-margin-call.herokuapp.com/alerts/${marginAccounts[0].publicKey}`,
            {
              method: 'GET',
              headers: headers,
            }
          )
            .then((response: any) => {
              if (!response.ok) {
                throw response
              }

              return response.json()
            })
            .catch((err) => {
              if (typeof err.text === 'function') {
                err.text().then((errorMessage: string) => {
                  notify({
                    message: errorMessage,
                    type: 'error',
                  })
                })
              } else {
                notify({
                  message: 'Something went wrong',
                  type: 'error',
                })
              }
            })

          // Add margin account address to alerts
          response.alerts.map(
            (alert) => (alert.acc = marginAccounts[0].publicKey)
          )

          setAlerts(response.alerts)
          setLoadAlerts(false)
        } else {
          const headers = { 'Content-Type': 'application/json' }
          const responses = await Promise.all(
            marginAccounts.map((account) => {
              return fetch(
                `https://mango-margin-call.herokuapp.com/alerts/${account.publicKey}`,
                {
                  method: 'GET',
                  headers: headers,
                }
              )
                .then((response: any) => {
                  if (!response.ok) {
                    throw response
                  }

                  return response.json()
                })
                .catch((err) => {
                  if (typeof err.text === 'function') {
                    err.text().then((errorMessage: string) => {
                      notify({
                        message: errorMessage,
                        type: 'error',
                      })
                    })
                  } else {
                    notify({
                      message: 'Something went wrong',
                      type: 'error',
                    })
                  }
                })
            })
          )

          // Add margin account address to alerts
          responses.map((accounts, index) =>
            accounts.alerts.map(
              (alert) => (alert.acc = marginAccounts[index].publicKey)
            )
          )

          // Structure array in the same way as for a single margin account
          const merged = [].concat.apply(
            [],
            responses.map((acc) => acc.alerts.map((alerts) => alerts))
          )

          setAlerts(merged)
          setLoadAlerts(false)
        }
      } else {
        setLoadAlerts(false)
      }
    }

    getAlerts()
  }, [marginAccounts])

  return { alerts, loadAlerts }
}
