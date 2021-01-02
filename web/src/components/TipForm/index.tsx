import styles from './TipForm.module.scss'
import Input from '@/components/Input'
import Button from '@/components/Button'
import CreditCardForm from '@/components/CreditCardForm'
import { useForm } from '@/hooks/useForm'
import { useMeQuery } from '@/queries/useMeQuery'
import { useTipAuthorMutation } from '@/mutations/useTipAuthorMutation'
import { StripeSource, User } from '@/types'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Props {
  author: User
}

const TipForm: React.FC<Props> = ({ author }) => {
  const { data } = useMeQuery()
  const { asPath } = useRouter()
  const [tipAuthor] = useTipAuthorMutation()
  const INITIAL_STATE = {
    amount: 1.0,
    authorId: author.id,
    sourceId: data?.me?.paymentMethods[0]?.id,
  }
  const formState = useForm(INITIAL_STATE, [data?.me])

  if (!data?.me) {
    return (
      <p>
        <Link href={`/login?next=${asPath}`}>Login</Link> to leave a
        tip!
      </p>
    )
  }

  const options = data.me.paymentMethods.map(
    (paymentMethod: StripeSource) => ({
      value: paymentMethod.id,
      text: paymentMethod.name,
    })
  )

  const tipText = `Tip $${formState.values.amount}`

  const handleTipClick = async (event: any, reset: Function) => {
    event.preventDefault()

    formState.values.amount = parseInt(formState.values.amount)
    await tipAuthor({ variables: formState.values })
    reset()
  }

  return (
    <>
      <form className={styles.form}>
        <Input
          type="select"
          name="sourceId"
          options={options}
          formState={formState}
        />
        <Input
          type="number"
          name="amount"
          step={0.01}
          min={1}
          formState={formState}
        />
        <Button onClick={handleTipClick}>{tipText}</Button>
      </form>
      <p>Need a different card?</p>
      <CreditCardForm />
    </>
  )
}

export default TipForm
