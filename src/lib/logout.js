import { Cookies } from 'flexible-cookies'

import config from '../config'
import { CONST_AUTHTOKEN_COOKIE } from './const'
import apollo from '../apollo'

export default async function (opts) {
  config.addAuth({ logout: opts })
  opts = config.getAuth().logout

  Cookies.delete(CONST_AUTHTOKEN_COOKIE, { source: opts.cookieSource })

  await opts.update(apollo.getClient(), null, opts.updateStore)

  opts.next && opts.next(null)

  return true
}