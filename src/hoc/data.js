import React from 'react'
import PropTypes from 'prop-types'
import { ApolloProvider, getDataFromTree } from 'react-apollo'
import Head from 'next/head'

import config from '../config'
import apollo from '../apollo'
import { getHOC, getComponentDisplayName } from '../lib/component'

export default getHOC((ComposedComponent, opts) => {
  if (opts.default) {
    opts.endpoint = opts.default
    delete opts.default
  }
  config.add(opts)

  class WithData extends React.Component {
    static displayName = `WithData(${getComponentDisplayName(
      ComposedComponent
    )})`
    static propTypes = {
      serverState: PropTypes.object.isRequired
    }

    static async getInitialProps(ctx) {
      // Initial serverState with apollo (empty)
      let serverState = {
        apollo: {
          data: {},
        },
        cookie: null
      }

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const cookieSource = process.browser ? document : ctx.req.headers
      config.add({ cookieSource })
      const apolloClient = apollo.getClient()
      try {
        // Run all GraphQL queries
        await getDataFromTree(
          <ApolloProvider client={apolloClient}>
            <ComposedComponent {...composedInitialProps} />
          </ApolloProvider>,
          {
            router: {
              asPath: ctx.asPath,
              pathname: ctx.pathname,
              query: ctx.query
            }
          }
        )
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
      }

      if (!process.browser) {
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind()
      }

      // Extract query data from the Apollo store
      serverState = {
        apollo: {
          data: apolloClient.cache.extract(),
        },
        cookie: cookieSource.cookie
      }

      return {
        serverState,
        ...composedInitialProps
      }
    }

    constructor(props) {
      super(props)
      const cookieSource = process.browser ? document : this.props.serverState
      config.add({ cookieSource })
      this.apolloClient = apollo.getClient(this.props.serverState.apollo.data)
    }

    render() {
      return (
        <ApolloProvider client={this.apolloClient}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      )
    }
  }

  return WithData
})
