import { NextPage } from 'next'
import { withApollo } from '@/utils/withApollo'
import { useStoriesQuery } from '@/queries/useStoriesQuery'
import styles from './Stories.module.scss'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import StoryList from '@/components/StoryList'
import Search from '@/components/Search'

interface Props {}

const PER_PAGE =
  parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT as string) || 10

const Stories: NextPage<Props> = (props) => {
  const { loading, data, fetchMore, variables } = useStoriesQuery({
    variables: { take: PER_PAGE, skip: 0 },
  })

  if (loading) {
    return <Loader />
  }

  const stories = data?.stories.stories

  const loadMore = (event: any, reset: Function) => {
    event.preventDefault()
    const newVars = {
      skip: data.stories.pageData.skip,
      take: variables?.take,
    }
    fetchMore({ variables: newVars })
    reset()
  }

  const renderMore = () => {
    if (!data?.stories.pageData.hasMore) return

    return <Button onClick={loadMore}>Get more</Button>
  }

  return (
    <div className={styles.stories}>
      <div className={styles.header}>
        <h2>Stories</h2>
        <Search perPage={PER_PAGE} />
      </div>
      <StoryList cardWrap showRating stories={stories} />
      {renderMore()}
    </div>
  )
}

export default withApollo({ ssr: true })(Stories)
