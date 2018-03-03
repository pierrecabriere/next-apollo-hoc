"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addConfig = addConfig;
exports.resetConfig = resetConfig;
const defaultConfig = {
  endpoint: null
};

let config = exports.config = defaultConfig;

function addConfig(...configs) {
  exports.config = config = Object.assign(config, ...configs);
}

function resetConfig() {
  exports.config = config = defaultConfig;
}
//# sourceMappingURL=config.js.map