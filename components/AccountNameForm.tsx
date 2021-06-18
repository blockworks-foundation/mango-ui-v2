import { FunctionComponent, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import useLocalStorageState from '../hooks/useLocalStorageState'
import Input from './Input'
import Button from './Button'

interface AccountNameFormProps {
  accountName?: string
  onClose?: (x?) => void
}

const AccountNameForm: FunctionComponent<AccountNameFormProps> = ({
  accountName,
  onClose,
}) => {
  const [name, setName] = useState(accountName || '')
  const selectedMarginAccount = useMangoStore(
    (s) => s.selectedMarginAccount.current
  )
  const [accountNames, setAccountNames] = useLocalStorageState('accountNames')

  const submitName = () => {
    const nameAccount = {
      publicKey: selectedMarginAccount.publicKey.toString(),
      name: name,
    }
    if (accountNames) {
      const hasName = accountNames.find(
        (acc) => acc.publicKey === selectedMarginAccount.publicKey.toString()
      )
      if (!hasName) {
        accountNames.push(nameAccount)
      } else {
        hasName.name = name
      }
      setAccountNames(accountNames)
    } else {
      setAccountNames([nameAccount])
    }
    onClose()
  }

  return (
    <>
      <div className="pb-2 text-th-fgd-1">Account Name</div>
      <Input
        type="text"
        className={`border border-th-fgd-4 flex-grow`}
        //   error={!!invalidNameMessage}
        placeholder="e.g. Calypso"
        value={name}
        //   onBlur={validateNameInput}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        onClick={() => submitName()}
        disabled={null}
        className="mt-4 w-full"
      >
        Save Name
      </Button>
    </>
  )
}

export default AccountNameForm
