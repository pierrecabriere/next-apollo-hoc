import { Cookies } from 'flexible-cookies'

import config from '../config'
import { CONST_AUTHTOKEN_COOKIE } from './const'
import apollo from '../apollo'

export default async function (opts) {
  config.addAuth({ login: opts })
  opts = config.getAuth().login
  let res

  try {
    const mutationOpts = {
      variables: opts.variables
    }
    res = await this.loginMutation(mutationOpts)
  } catch (e) {
    console.error(e)
    return false
  }
  const data = res.data

  try {
    const authToken = opts.authToken(data)
    Cookies.set(CONST_AUTHTOKEN_COOKIE, authToken, { source: opts.cookieSource, days: 365 })
  } catch (e) {
    console.error(e)
    return null
  }

  try {
    await opts.update(apollo.getClient(), data, opts.updateStore)
  } catch (e) {
    console.error(e)
  }

  if (opts.next) {
    try {
      opts.next(data)
    } catch (e) {
      console.error(e)
    }
  }

  return data
}