import { gql } from 'apollo-boost'

export const SIGN_IN = gql`
  mutation signinUser($email: String!, $password: String!) {
    signinUser(email: $email password: $password) {
      token
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation updateUserRole($_id: Float!, $role: String!) {
    updateUserRole(_id: $_id, role: $role) {
      _id
      role
    }
  }
`

export const DELETE_USER = gql`
  mutation deleteUser($_id: Float!) {
    deleteUser(_id: $_id) {
      _id
    }
  }
`
