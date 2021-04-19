dynamic({
  loader: async function () {
    var _interopRequireDefault = require("$CWD/node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/interopRequireDefault");

    var _react = _interopRequireDefault(await import("react"));

    var _antd = await import("antd");

    await import("$CWD/packages/preset-dumi/src/transformer/fixtures/raw/index.less");

    var _default = function _default() {
      return /*#__PURE__*/_react["default"].createElement(_antd.Button, null);
    };

    return _default;
  }
})