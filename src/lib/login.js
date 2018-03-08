import { Cookies } from 'flexible-cookies'

import config from '../config'
import { CONST_AUTHTOKEN_COOKIE } from './const'
import apollo from '../apollo'

export default async function (opts) {
  config.addAuth({ login: opts })
  opts = config.getAuth().login

  const mutationOpts = {
    variables: opts.variables
  }
  const { data } = await this.loginMutation(mutationOpts)

  const authToken = opts.authToken(data)
  Cookies.set(CONST_AUTHTOKEN_COOKIE, authToken, { source: opts.cookieSource, days: 365 })

  await opts.update(apollo.getClient(), data, opts.updateStore)

  opts.next && opts.next(data)

  return data
}