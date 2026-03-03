import { gql } from 'apollo-boost'

export const CREATE_CATEGORY = gql`
  mutation createCategory($name: String!) {
    createCategory(name: $name) {
      _id
      name
      slug
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation deleteCategory($_id: Float!) {
    deleteCategory(_id: $_id) {
      _id
      name
    }
  }
`
