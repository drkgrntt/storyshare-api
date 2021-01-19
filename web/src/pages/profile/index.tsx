import { ParsedUrlQuery } from 'querystring'
import Link from 'next/link'
import { useEffect } from 'react'
import { NextPage } from 'next'
import Error from 'next/error'
import styles from './Profile.module.scss'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { useLogoutEverywhereMutation } from '@/mutations/useLogoutEverywhereMutation'
import { useIsAuth } from '@/hooks/useIsAuth'
import Loader from '@/components/Loader'
import StoryList from '@/components/StoryList'
import PasswordResetForm from '@/components/PasswordResetForm'
import PenNameForm from '@/components/PenNameForm'
import { useMeQuery } from '@/queries/useMeQuery'
import { Comment, Story, StripeSource, User } from '@/types'
import { useRemoveFavoriteStoryMutation } from '@/mutations/useRemoveFavoriteStoryMutation'
import Modal from '@/components/Modal'
import { useExchangeTokenMutation } from '@/mutations/useExchangeTokenMutation'
import { withApollo } from '@/utils/withApollo'
import CreditCardForm from '@/components/CreditCardForm'
import { useRemovePaymentMethodMutation } from '@/mutations/useRemovePaymentMethodMutation'

interface Props {
  query: ParsedUrlQuery
}

const Profile: NextPage<Props> = ({ query }) => {
  const [exchangeToken] = useExchangeTokenMutation()
  const [logoutEverywhere, logoutData] = useLogoutEverywhereMutation()
  const [removeFavoriteStory] = useRemoveFavoriteStoryMutation()
  const [removePaymentMethod] = useRemovePaymentMethodMutation()
  const { loading, data } = useMeQuery()
  const me: User = data?.me
  useIsAuth()
  useEffect(() => {
    if (me && query.token)
      exchangeToken({ variables: { token: query.token } })
  }, [me, query.token])

  if (loading) {
    return <Loader />
  }

  if (!me) {
    return <Error statusCode={401} />
  }

  const onLogoutEverywhereClick = async (
    event: any,
    reset: Function
  ) => {
    try {
      await logoutEverywhere()
    } catch (err) {}
    reset()
  }

  const onRemoveStoryClick = async (story: Story) => {
    await removeFavoriteStory({ variables: { storyId: story.id } })
  }

  const renderAuthorList = () => {
    return me.subscriptions.map((subscription) => {
      return (
        <li key={subscription.id}>
          <Link href={`/profile/${subscription.subscribedTo.id}`}>
            <a>{subscription.subscribedTo.penName}</a>
          </Link>
        </li>
      )
    })
  }

  const renderEdited = (comment: Comment) => {
    const createdAt = new Date(comment.createdAt)
    const updatedAt = new Date(comment.updatedAt)
    if (createdAt.toISOString() === updatedAt.toISOString()) return

    return <p>(edited {updatedAt.toLocaleDateString()})</p>
  }

  const renderComments = () => {
    return me.comments
      .map((comment) => {
        let link = '/stories'
        if (comment.story) {
          link = `${link}/${comment.story?.id}`
        } else {
          link = `${link}/${comment.chapter?.story.id}/chapters/${comment.chapter?.id}`
        }
        return (
          <li key={comment.id}>
            <Link href={link}>
              <a>{comment.story?.title || comment.chapter?.title}</a>
            </Link>
            <p>{comment.body}</p>
            <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
            {renderEdited(comment)}
            <br />
          </li>
        )
      })
      .reverse()
  }

  const handleRemovePaymentMethod = async (
    paymentMethod: StripeSource
  ) => {
    const confirm = window.confirm(
      `Are you sure you want to remove ${paymentMethod.name}?`
    )
    if (!confirm) return

    await removePaymentMethod({
      variables: { sourceId: paymentMethod.id },
    })
  }

  return (
    <div className={styles.profile}>
      <h2>Profile</h2>
      <Link href="/writer-dashboard">
        <a>Go to your writer's dashboard</a>
      </Link>

      <Card>
        <label>
          Discard all other authentication tokens to log out
          everywhere.
        </label>
        <Button
          styleTypes={['delete']}
          onClick={onLogoutEverywhereClick}
        >
          Discard
        </Button>
        <p>
          {logoutData?.data?.logoutEverywhere?.value &&
            'All tokens have now been discarded. Your current session is the only remaining valid session.'}
        </p>
      </Card>

      <Card>
        <div className={styles.userInfoHeader}>
          <h3>User Info</h3>
          <Modal closeId="close-pen-name-form" buttonText="Edit">
            <h2>Set a new pen name</h2>
            <PenNameForm
              onSuccess={() => {
                const close = document.getElementById(
                  'close-pen-name-form'
                )
                close?.click()
              }}
            />
          </Modal>
        </div>
        <hr />
        <ul>
          <li>Email (no one sees this but you): {me.email}</li>
          <li>Pen Name: {me.penName}</li>
        </ul>
        <Modal
          closeId="close-password-reset-form"
          buttonText="Reset password"
        >
          <PasswordResetForm
            onSuccess={() => {
              const close = document.getElementById(
                'close-password-reset-form'
              )
              close?.click()
            }}
          />
        </Modal>
      </Card>

      <Card>
        <h3>Favorite Authors</h3>
        <hr />
        <ul>{renderAuthorList()}</ul>
      </Card>

      <Card>
        <h3>Favorite Stories</h3>
        <hr />
        <StoryList
          actionText="Remove"
          action={onRemoveStoryClick}
          stories={me.favoriteStories}
        />
      </Card>

      <Card>
        <h3>Payment Methods</h3>
        <hr />
        <ul>
          {me.paymentMethods.map((source) => (
            <li key={source.id}>
              <span>{source.name}</span>{' '}
              <a onClick={() => handleRemovePaymentMethod(source)}>
                Remove
              </a>
            </li>
          ))}
        </ul>
        <CreditCardForm />
      </Card>

      {/* <Card>
        <h3>Favorite Genres</h3>
      </Card> */}

      <Card>
        <h3>Comments</h3>
        <hr />
        <ul>{renderComments()}</ul>
      </Card>
    </div>
  )
}

Profile.getInitialProps = ({ res, query }) => {
  if (res && query.token) {
    res.setHeader('set-cookie', [`token=${query.token}`])
  }
  return { query }
}

export default withApollo({ ssr: false })(Profile)
