import { gql } from "@apollo/client";

export const SEND_OTP = gql`
  mutation SendOTP($phoneNumber: String!) {
    sendOTP(phoneNumber: $phoneNumber) {
      success
      message
      isNewUser
      expiresIn
      otp
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOTP($input: VerifyOTPInput!) {
    verifyOTP(input: $input) {
      success
      accessToken
      idToken
      refreshToken
      isNewUser
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmailId($email: String!) {
    verifyEmailId(email: $email) {
      available
      message
    }
  }
`;

export const ADD_PRODUCT = gql`
  mutation AddProduct($input: AddBidProductInput!) {
    addProduct(input: $input) {
      productId
      name
      expectedPrice
      bidStartDate
      bidEndDate
      imageUrls
      descriptionText
      userId
      location {
        lat
        lng
      }
      locationName
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      description
      category
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;
