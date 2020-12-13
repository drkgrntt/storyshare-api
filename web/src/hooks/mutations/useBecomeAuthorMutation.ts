import { gql, useMutation } from '@apollo/client'
import { UserInfo } from '@/fragments/UserInfo'

export const becomeAuthorMutation = gql`
  mutation BecomeAuthor($price: String!, $sourceId: String!) {
    becomeAuthor(price: $price, sourceId: $sourceId) {
      ...UserInfo
    }
  }
  ${UserInfo}
`

export const useBecomeAuthorMutation = () => {
  return useMutation(becomeAuthorMutation)
}
