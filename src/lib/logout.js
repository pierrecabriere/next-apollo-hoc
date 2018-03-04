import { Cookies } from 'flexible-cookies'

import config from '../config'
import { CONST_AUTHTOKEN_COOKIE } from './const'
import apollo from '../apollo'

export default async function (opts) {
  config.addAuth({ logout: opts })
  opts = config.getAuth().logout

  try {
    console.log('delete auth cookie')
    Cookies.delete(CONST_AUTHTOKEN_COOKIE, { source: opts.cookieSource })
  } catch (e) {
    console.error(e)
    return null
  }

  if (opts.update) {
    try {
      opts.update(apollo.getClient(), null, opts.updateStore)
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