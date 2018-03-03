import { Cookies } from 'js-cookies'

import config from '../config'
import { CONST_AUTHTOKEN_COOKIE } from './const'
import apollo from '../apollo'

export default async function (opts) {
  config.add({ auth: { logout: opts } })
  opts = config.get().auth.logout

  try {
    Cookies.delete(CONST_AUTHTOKEN_COOKIE, { source: opts.cookieSource })
  } catch (e) {
    console.error(e)
    return null
  }

  apollo.resetStore()

  if (opts.updateStore) {
    try {
      apollo.getClient().writeQuery(opts.updateStore(null))
    } catch (e) {
      console.error(e)
    }
  }

  if (opts.next) {
    try {
      opts.next()
    } catch (e) {
      console.error(e)
    }
  }

  return true
}