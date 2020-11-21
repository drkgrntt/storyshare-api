import { useContext, useState } from 'react'
import Error from 'next/error'
import styles from './Edit.module.scss'
import Card from '../../../../components/Card'
import StoryForm from '../../../../components/StoryForm'
import { useUpdateStoryMutation } from '../../../../hooks/useUpdateStoryMutation'
import { useStoryQuery } from '../../../../hooks/useStoryQuery'
import { Genre, PublishStatus, Story } from '../../../../types'
import { useRouter } from 'next/router'
import userContext from '../../../../context/userContext'

const Edit: React.FC<{}> = () => {

  const { push, query } = useRouter()
  const [updateStory] = useUpdateStoryMutation()
  const { currentUser, setCurrentUser } = useContext(userContext)
  const result = useStoryQuery({ id: query.id as string })
  const story = result.data?.story

  if (!currentUser || !story) {
    return <Error statusCode={404} />
  }

  const save = async (formState: any) => {
    formState.values.status = formState.values.publish
      ? PublishStatus.Published
      : PublishStatus.Draft
    formState.values.genreIds = formState.values.genres.map((g: Genre) => g.id)

    try {
      const result = await updateStory({ variables: formState.values })
      const updatedStory = result.data.updateStory
      const stories = currentUser.stories.map(s => s.id === updatedStory.id ? updatedStory : s)

      setCurrentUser({ ...currentUser, stories })
      return updatedStory
    } catch (error) {
      console.warn(error)
      formState.setValues({
        ...formState.values,
        validation: error.message
      })
      return null
    }
  }

  const handleSubmit = async (formState: any) => {
    const story = await save(formState)
    if (!story) return
    push(`/stories/${story.id}`)
  }

  return (
    <div>
      <h2>Edit Story</h2>
      <Card>
        <StoryForm
          story={story}
          autoSave={save}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  )
}

export default Edit
