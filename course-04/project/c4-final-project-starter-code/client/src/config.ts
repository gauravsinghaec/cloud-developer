// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'e4mu7cbyk3'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-53b5hwms6204x6bd.us.auth0.com', // Auth0 domain
  clientId: 'H57mNCLqF1OMl2uwE28v6W2BCYajQZLE', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
