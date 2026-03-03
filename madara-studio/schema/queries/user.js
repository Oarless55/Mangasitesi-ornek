import { gql } from 'apollo-boost'

export const GET_MY_ACCOUNT = gql`
  query me {
    me {
      _id
      name
      email
      avatar
      role
    }
  }
`

export const GET_USERS = gql`
  query getUsers {
    getUsers {
      _id
      name
      email
      avatar
      role
      createdAt
    }
  }
`
