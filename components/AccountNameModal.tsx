import { FunctionComponent, useState } from 'react'
import useMangoStore from '../stores/useMangoStore'
import useLocalStorageState from '../hooks/useLocalStorageState'
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import Input from './Input'
import Button from './Button'
import Modal from './Modal'
import { ElementTitle } from './styles'
import Tooltip from './Tooltip'

interface AccountNameModalProps {
  accountName?: string
  isOpen: boolean
  onClose?: (x?) => void
}

const AccountNameModal: FunctionComponent<AccountNameModalProps> = ({
  accountName,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState(accountName || '')
  const [invalidNameMessage, setInvalidNameMessage] = useState('')
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

  const validateNameInput = () => {
    if (name.length >= 25) {
      setInvalidNameMessage('Account name nust be less than 25 characters')
    }
    if (name.length === 0) {
      setInvalidNameMessage('Enter an account name')
    }
  }

  const onChangeNameInput = (name) => {
    setName(name)
    if (invalidNameMessage) {
      setInvalidNameMessage('')
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <Modal.Header>
        <div className="flex items-center">
          <ElementTitle noMarignBottom>Name your Account</ElementTitle>
          <Tooltip content="Account names are stored locally in your browser. If you clear your browser cache they will be lost. We'll be storing them on-chain soon.">
            <InformationCircleIcon className="h-5 w-5 ml-2 text-th-primary" />
          </Tooltip>
        </div>
      </Modal.Header>
      <div className="pb-2 text-th-fgd-1">Account Name</div>
      <Input
        type="text"
        className={`border border-th-fgd-4 flex-grow`}
        error={!!invalidNameMessage}
        placeholder="e.g. Calypso"
        value={name}
        onBlur={validateNameInput}
        onChange={(e) => onChangeNameInput(e.target.value)}
      />
      {invalidNameMessage ? (
        <div className="flex items-center pt-1.5 text-th-red">
          <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
          {invalidNameMessage}
        </div>
      ) : null}
      <Button
        onClick={() => submitName()}
        disabled={null}
        className="mt-4 w-full"
      >
        Save Name
      </Button>
    </Modal>
  )
}

export default AccountNameModal
