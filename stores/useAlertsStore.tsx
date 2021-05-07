import create, { State } from 'zustand'
import produce from 'immer'
import { PublicKey } from '@solana/web3.js'
import { notify } from '../utils/notifications'

type AlertProvider = 'mail' | 'sms' | 'tg'

interface Alert {
  acc: PublicKey
  alertProvider: AlertProvider
  collateralRatioThresh: number
  open: boolean
  timestamp: number
  triggeredTimestamp: number | undefined
}

interface AlertRequest {
  alertProvider: AlertProvider
  collateralRatioThresh: number
  mangoGroupPk: string
  marginAccountPk: string
  phoneNumber: any
  email: string | undefined
}

interface AlertsStore extends State {
  alerts: Array<Alert>
  activeAlerts: Array<Alert>
  triggeredAlerts: Array<Alert>
  loading: boolean
  error: string
  submitting: boolean
  success: string
  tgCode: string | null
  set: (s: any) => void
  actions: { [key: string]: (any) => void }
}

const useAlertsStore = create<AlertsStore>((set, get) => ({
  alerts: [],
  activeAlerts: [],
  triggeredAlerts: [],
  loading: false,
  error: '',
  submitting: false,
  success: '',
  tgCode: null,
  set: (fn) => set(produce(fn)),
  actions: {
    async createAlert(req: AlertRequest) {
      const set = get().set
      const alert = {
        acc: new PublicKey(req.marginAccountPk),
        alertProvider: req.alertProvider,
        collateralRatioThresh: req.collateralRatioThresh,
        open: true,
        timestamp: Date.now(),
      }

      set((state) => {
        state.submitting = true
        state.error = ''
        state.success = ''
      })

      const fetchUrl = `https://mango-margin-call.herokuapp.com/alerts`
      const headers = { 'Content-Type': 'application/json' }

      fetch(fetchUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(req),
      })
        .then((response: any) => {
          if (!response.ok) {
            throw response
          }
          return response.json()
        })
        .then((json: any) => {
          const alerts = get().alerts

          set((state) => {
            state.alerts = [alert as Alert].concat(alerts)
            state.success = json.code ? '' : 'Alert saved successfully'
            state.tgCode = json.code
          })
        })
        .catch((err) => {
          if (typeof err.text === 'function') {
            err.text().then((errorMessage: string) => {
              set((state) => {
                state.error = errorMessage
              })
              notify({
                message: errorMessage,
                type: 'error',
              })
            })
          } else {
            set((state) => {
              state.error = 'Something went wrong'
            })
            notify({
              message: 'Something went wrong',
              type: 'error',
            })
          }
        })
        .finally(() => {
          set((state) => {
            state.submitting = false
          })
        })
    },
    async loadAlerts(marginAccounts: PublicKey[]) {
      const set = get().set

      set((state) => {
        state.loading = true
      })

      const headers = { 'Content-Type': 'application/json' }
      const responses = await Promise.all(
        marginAccounts.map((pubkey) => {
          return fetch(
            `https://mango-margin-call.herokuapp.com/alerts/${pubkey}`,
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
      responses.forEach((accounts, index) =>
        accounts.alerts.forEach((alert) => (alert.acc = marginAccounts[index]))
      )

      const flattenAccountAlerts = [].concat.apply(
        [],
        responses.map((acc) => acc.alerts.map((alerts) => alerts))
      )

      const triggeredAlerts = flattenAccountAlerts
        .filter((alert) => !alert.open)
        .sort((a, b) => {
          var aTriggeredTimestamp = a.hasOwnProperty('triggeredTimestamp')
          var bTriggeredTimestamp = b.hasOwnProperty('triggeredTimestamp')
          if (aTriggeredTimestamp && bTriggeredTimestamp) {
            return b.triggeredTimestamp - a.triggeredTimestamp
          }
          return aTriggeredTimestamp ? -1 : bTriggeredTimestamp ? 1 : 0
        })

      const activeAlerts = flattenAccountAlerts.filter((alert) => alert.open)

      set((state) => {
        state.activeAlerts = activeAlerts
        state.triggeredAlerts = triggeredAlerts
        state.loading = false
      })
    },
  },
}))

export default useAlertsStore
