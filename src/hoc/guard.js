import React from 'react'
import { graphql, ApolloProvider, getDataFromTree } from 'react-apollo'
import Head from 'next/head'

import { getHOC, getComponentDisplayName } from '../lib/component'
import apollo from '../apollo'
import config from "../config"

export default getHOC((ComposedComponent, opts) => {
  if (opts.default) {
    opts.guards = [opts.default]
  }

  opts.guards.forEach((guard, index) => {
    if ('object' === typeof guard && guard.name) {
      config.addGuard(guard)
    }

    if ('string' === typeof guard) {
      opts.guards[index] = config.getGuard(guard)
    }
  })

  class WithGuard extends React.Component {
    static displayName = `WithGuard(${getComponentDisplayName(
      ComposedComponent
    )})`

    static async getInitialProps(ctx) {
      let guard

      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      const cookieSource = process.browser ? document : ctx.req.headers
      config.add({ cookieSource })
      const apolloClient = apollo.getClient()
      try {
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
      }

      if (!process.browser) {
        Head.rewind()
      }

      opts.guards.forEach(g => {
        let data = null

        data = apolloClient.readQuery({ query: g.query })

        guard = undefined === guard ? g.guard(data) : g.guard(data) && guard

        g.next && g.next(guard, ctx)
      })

      opts.next && opts.next(guard)

      return {
        guard,
        ...composedInitialProps
      }
    }

    render() {
      return (
        <ComposedComponent {...this.props} />
      )
    }
  }

  let hoc = WithGuard
  opts.guards.forEach(guard => {
    if (guard.query)
      hoc = graphql(guard.query, {
        options: { errorPolicy: 'all' }
      })(hoc)
  })

  return hoc
})