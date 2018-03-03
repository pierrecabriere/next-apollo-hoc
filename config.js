"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const defaultConfig = {
  endpoint: null,
  cookieSource: null,
  apollo: {
    data: null
  },
  guards: [],
  auth: {
    login: {
      cookieSource: null,
      variables: null,
      updateStore: null,
      update: null,
      next: null,
      authToken: null
    },
    logout: {
      cookieSource: null,
      updateStore: null,
      next: null
    }
  }
};

class Config {

  constructor() {
    this.config = null;

    this.reset();
  }

  reset() {
    this.config = defaultConfig;
  }

  static assign(config1, config2) {
    if (config1 && config1.auth && config2 && config2.auth) {
      config1.auth.login = Object.assign(config1.auth.login || {}, config2.auth.login || {});
      delete config2.auth.login;

      config1.auth.logout = Object.assign(config1.auth.logout || {}, config2.auth.logout || {});
      delete config2.auth.logout;
    }

    if (config1 && config1.guards && config2 && config2.guards) {
      config1.guards.forEach((guard1, index1) => {
        config2.guards.forEach((guard2, index2) => {
          if (guard1.name === guard2.name) {
            config1.guards[index1] = Object.assign(guard1, guard2);
            delete config2.guards[index2];
          }
        });
      });

      if (config2.guards.length) {
        config2.guards.forEach(guard => {
          if (guard.name) config1.guards.push(guard || []);
        });
      }

      delete config2.guards;
    }

    if (config1 && config2) {
      config1.auth = Object.assign(config1.auth || {}, config2.auth || {});
      delete config2.auth;
    }

    config1 = Object.assign(config1, config2);

    return config1;
  }

  add(config) {
    this.config = Config.assign(this.config, config);
  }

  get() {
    return this.config;
  }
}

exports.default = new Config();
//# sourceMappingURL=config.js.map