import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, concat } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'isomorphic-unfetch'
import { Cookies } from 'flexible-cookies'

import config from './config'
import { CONST_AUTHTOKEN_COOKIE } from './lib/const'

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

function createApolloClient(initialState) {
  const { endpoint, link } = config.get()
  let httpLink

  if ('object' === typeof link && !link.request) {
    const linkOpts = Object.assign({
      uri: endpoint, // Server URL (must be absolute)
    }, link)
    httpLink = new HttpLink(linkOpts)
  } else {
    httpLink = link
  }

  const authMiddleware = new ApolloLink((operation, forward) => {
    const headers = {}
    const authorization = getAuthorization()
    if (authorization)
      headers.authorization = authorization

    console.log('call middleware')

    // add the authorization to the headers
    operation.setContext({
      headers
    })

    return forward(operation)
  })

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache().restore(initialState || {})
  })
}

function getAuthorization() {
  const { cookieSource } = config.get()

  const cookieToken = Cookies.get(CONST_AUTHTOKEN_COOKIE, { source: cookieSource })
  return cookieToken ? `Bearer ${cookieToken}` : null
}

class Apollo {
  client = null

  getClient(initialState) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    let newApolloClient;

    if (!process.browser || !this.client) newApolloClient = createApolloClient(initialState)

    if (!process.browser) return newApolloClient

    // Reuse client on the client-side
    if (!this.client) this.client = newApolloClient

    return this.client
  }
}

export default new Apollo()
