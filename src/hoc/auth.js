import React from 'react'
import { graphql } from 'react-apollo'

import login from '../lib/login'
import logout from '../lib/logout'

import config from '../config'
import { getHOC, getComponentDisplayName } from '../lib/component'

export default getHOC((ComposedComponent, opts) => {
  config.addAuth(opts)
  opts = config.getAuth()

  class WithAuth extends React.Component {
    static displayName = `WithAuth(${getComponentDisplayName(
      ComposedComponent
    )})`

    static async getInitialProps(ctx) {
      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      return {
        ...composedInitialProps
      }
    }

    render() {
      let props = this.props
      let childProps = {
        login,
        logout
      }

      return (
        <ComposedComponent {...props} {...childProps} />
      )
    }
  }

  let hoc = WithAuth
  if (opts.login && opts.login.mutation)
    hoc = graphql(opts.login.mutation, {
      name: 'loginMutation'
    })(hoc)

  return hoc
})
