import { NextPage } from 'next'
import Link from 'next/link'
import { ParsedUrlQuery } from 'querystring'
import styles from './Dashboard.module.scss'
import { useContext } from 'react'
import Error from 'next/error'
import Loader from '@/components/Loader'
import StoryInfo from '@/components/StoryInfo'
import DeleteChapterForm from '@/components/DeleteChapterForm'
import Card from '@/components/Card'
import { useStoryQuery } from '@/queries/useStoryQuery'
import { useChapterQuery } from '@/queries/useChapterQuery'
import userContext from '@/context/userContext'
import { Story, Chapter } from '@/types'

interface Props {
  query: ParsedUrlQuery
}

const Dashboard: NextPage<Props> = ({ query }) => {
  const getStory = useStoryQuery()
  const storyVariables = { id: query.storyId }
  const storyResult = getStory({ variables: storyVariables, skip: !query.storyId })
  const getChapter = useChapterQuery()
  const chapterVariables = { id: query.chapterId }
  const chapterResult = getChapter({ variables: chapterVariables, skip: !query.chapterId })
  const { currentUser } = useContext(userContext)

  switch (true) {
    case !!storyResult.error || !!chapterResult.error:
      return <Error statusCode={404} />

    case !!storyResult.loading || !!chapterResult.loading:
      return <Loader />
  }

  const { story }: { story: Story } = storyResult.data
  const { chapter }: { chapter: Chapter } = chapterResult.data

  if (currentUser?.id !== story.authorId) {
    return <Error statusCode={403} />
  }

  return (
    <div>
      <h2>{story.title}</h2>
      <Link href="/writer-dashboard">
        <a>Back to writer's dashboard</a>
      </Link>

      <Card>
        {/* <StoryInfo story={story} /> */}
        <Link href={`/stories/${story.id}/chapters/${chapter.id}/edit`}>
          <a>Edit the chapter</a>
        </Link>
      </Card>

      <Card>
        <DeleteChapterForm story={story} chapter={chapter} />
      </Card>
    </div>
  )
}

Dashboard.getInitialProps = ({ query }) => {
  return { query }
}

export default Dashboard
