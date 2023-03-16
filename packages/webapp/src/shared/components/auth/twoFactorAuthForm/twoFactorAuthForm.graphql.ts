import { gql } from '@sb/webapp-api-client/graphql';

export const generateOtpMutation = gql(/* GraphQL */ `
  mutation generateOtp($input: GenerateOTPMutationInput!) {
    generateOtp(input: $input) {
      base32
      otpauthUrl
    }
  }
`);

export const verifyOtpMutation = gql(/* GraphQL */ `
  mutation verifyOtp($input: VerifyOTPMutationInput!) {
    verifyOtp(input: $input) {
      otpVerified
    }
  }
`);

export const validateOtpMutation = gql(/* GraphQL */ `
  mutation validateOtp($input: ValidateOTPMutationInput!) {
    validateOtp(input: $input) {
      access
      refresh
    }
  }
`);

export const disableOtpMutation = gql(/* GraphQL */ `
  mutation disableOtp($input: DisableOTPMutationInput!) {
    disableOtp(input: $input) {
      ok
    }
  }
`);
