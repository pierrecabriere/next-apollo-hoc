import React from 'react'
import { graphql } from 'react-apollo'

import login from '../lib/login'
import logout from '../lib/logout'

import config from '../config'
import { getDecorator, getComponentDisplayName } from '../lib/component'

export default getDecorator((ComposedComponent, opts) => {
  config.add({ auth: opts })
  opts = config.get().auth

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

  let decorator = WithAuth
  if (opts.login && opts.login.mutation)
    decorator = graphql(opts.login.mutation, {
      name: 'loginMutation'
    })(decorator)

  return decorator
})
