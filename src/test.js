const a = ";\r\nrequire('./myWebLogTracker.min');\r\n;\r\nrequire('./myWebLogTracker.min');\r\n;\r\nrequire('./myWebLogTracker.min');\r\n;\r\nrequire('./myWebLogTracker.min');\r\n;\nrequire('./myWebLogTracker.min');\n\nimport Vue from 'vue'\nimport './app.scss'\n// import Taro from '@tarojs/taro';\n// var gio = require(\"./gio-minp/index.js\").default;\n// gio('init', '9752ffcce0acf67c', 'wx824236ac8b3edcf8', { version: '1.0', taro: Taro });\n\n\nconst app = new Vue({\n  onShow (options) {\n    console.log('app onshow', options)\n  },\n  render(h) {\n    return h('block', this.$slots.default)\n  }\n})\n\nexport default app\n"

// const trackerScriptTag = new RegExp(`;\r\nrequire('./myWebLogTracker.min');\r\n`,'g');
const trackerScriptTag = /;\r\nrequire\('.\/myWebLogTracker.min'\);\r\n/g

const c = a.replace(trackerScriptTag, '');
console.log('c', c)