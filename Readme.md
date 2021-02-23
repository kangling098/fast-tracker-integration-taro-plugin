# fast-tracker-integration-taro-plugin

天眼taro小程序探针集成插件

## 插件功能
fast-tracker-integration-taro-plugin是基于专门为taro小程序集成天眼探针的taro插件

项目引入插件后,需要配置好 产品编码 product_code、应用编码 app_code、环境编码 env_code, file_path_arr 源码中应用入口app.js 的绝对地址 在天眼管理中心修改探针配置后,每次构建都将会从天眼拉取对应环境的探针代码,并将探针文件输出到项目app.js同级,并引入文件

## 配置项

<div style="width: 120px">配置</div> | <div style="width: 60px">字段类型</div> | 说明 | <div style="min-width: 60px">是否必填</div> | <div style="width: 60px">默认值</div>
---|---|---|---|---
app_code (通用配置参数) | string | 应用编码 | 是 | 无默认值
product_code (通用配置参数) | string | 产品编码 | 是 | 无默认值
type (探针集成配置参数) | string  | 'taro' | 是 | false
env_code (探针集成配置参数) | string | 环境编码(生产: prod、预发布: beta、测试: test、开发: dev) | 是 | 无默认值
file_path_arr (探针集成配置参数) | array | 源码应用入口app.js的绝对路径 | 是 | 无默认值
## 使用

```js
npm i fast-tracker-integration-webpack-plugin -D
```
在webpack中
```js
coost FastTrackerIntegrationWebpackPlugin = require('fast-tracker-integration-taro-plugin');
const path = require('path');
const config = {
  projectName: 'taro-components-sample',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  sass: {
    importer: sassImporter
  },
  defineConstants: {
    WWW: JSON.stringify('www')
  },
  plugins: [
    ['fast-tracker-integration-taro-plugin', {
      type: 'taro',
      product_code: 'fast-test',
      app_code: 'test-app-add',
      env_code: 'prod',
      file_path_arr: [path.resolve(__dirname, '../src/app.js')],
    }]
  ],
  mini: {
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true
        }
      }
    }
  }
}
```
## 注意事项
1. 由于taro集成探针需要传入taro本体,使用时将会修改 file_path_arr 指定的js文件源码,在程序异常中断时,可能会有遗留代码保留在app.js中

