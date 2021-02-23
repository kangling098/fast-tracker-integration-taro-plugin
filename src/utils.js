const request = require('request-promise');
const fs = require('fs');
const path = require('path');
function fwarn(str) {
  console.warn(`fast-tracker-integration-webpack-plugin warning: `, str);
}
exports.fwarn = fwarn;
// 校验生成参数
exports.validateAndGenenateOption = (options = {}) => {
  const returnOpts = { available: true, test_tracker_url: options.test_tracker_url };
  // 必填字段
  const requiredFieldsArr = ['product_code', 'app_code'];
  requiredFieldsArr.forEach(v => {
    if (!options[v]) {
      fwarn(`${v} 必填`);
      returnOpts.available = false;
    } else {
      returnOpts[v] = options[v]
    }
  })

  // 环境code校验
  const envCodeList = {
    prod: true,
    beta: true,
    test: true,
    dev: true,
  };
  if (envCodeList[options.env_code]) {
    returnOpts.env_code = options.env_code
  } else {
    fwarn(`env_code 必须为 'prod'、'beta'、'test'、'dev' 中的一种`);
    returnOpts.available = false;
  }

  // 需加载探针文件html
  if (Array.isArray(options.file_path_arr) && options.file_path_arr.length) {
    returnOpts.file_path_arr = [options.file_path_arr[0]];
  } else {
    fwarn(`file_path_arr 必填`);
    returnOpts.available = false;
  }

  return returnOpts;
}

// 下载探针
exports.getTrackerFile = async ({
  product_code,
  app_code,
  env_code,
  test_tracker_url
}) => {
  let data = '';
  const trackerUrl = test_tracker_url || `https://mic-open.mypaas.com.cn/web-log-tracker/${product_code}/${app_code}/myWebLogTracker.min.${env_code}.wxmp.js`
  try {
    data = await request(trackerUrl);
  } catch(e) {
    fwarn('探针加载失败')
  }

  // 取不到数据,直接返回空
  if (!data) {return data}

  data = `\r\nimport Taro from '@tarojs/taro';\r\n`+ data;
  data = data + `;global.__myWebLogTracker__ = global.myWebLogTracker.default({"trace_config": null, "tenant_code_query": {"range": ["url", "localstorage", "cookie"], "key": ""}, "ignore_pages": [], "api_url_regx": "", "page_interval": 1800000, "report_logs_threshold": {"WeChat Mini Program": 5}, "is_spa": true, "log_event_attribute": "data-event", "env_code": "test", "api_ignore_urls": [], "user_account_query": {"range": ["url", "localstorage", "cookie"], "key": ""}, "product_code": "fast-test", "log_content_attribute": "data-log", "user_group_query": {"range": ["url", "localstorage", "cookie"], "key": ""}, "manual_report_page_load": false, "log_module_attribute": "data-module", "report_api_params": true, "collect_event_types": ["event", "page", "api", "click", "error", "crash", "user-defined"], "taro": Taro, "app_code": "taro3_tracker", "include_search": true});Object.defineProperty(wx.__proto__, '__myWebLogTracker__', {
    value: global.__myWebLogTracker__,
    writable: false
  });`
  const insertIndex = data.indexOf(`, "app_code":`);
  if (insertIndex > -1) {
    data = data.slice(0, insertIndex) + `, "taro": Taro` + data.slice(insertIndex);
  }

  return data
}

exports.setWXMPTracker = (trackerData, options) => {
  const {
    file_path_arr,
  } = options;
  
  const trackerScriptTag = `;\r\nrequire('./myWebLogTracker.min');\r\n`;
  // 对于
  file_path_arr.forEach(filePath => {
    let fileData = fs.readFileSync(filePath, 'utf8');
    if (fileData.match(trackerScriptTag)) {
      return;
    }
    let trackerIndex = 0;
    const matchObj = fileData.match(/\Suse strict\S/);
    if (matchObj) {
      trackerIndex = matchObj.index + matchObj[0].length;
    }
    
    // 是否已经插入过探针文件,已经插入的话,不再重复插入
    const hasInsertTracker = fileData.indexOf(`require('./myWebLogTracker.min');`) > -1;
    if (!hasInsertTracker) {
      // 拼接script标签(小程序require引入)
      fileData = fileData.slice(0, trackerIndex) + trackerScriptTag + fileData.slice(trackerIndex);
      // 探针文件写入
      fs.writeFileSync(path.resolve(filePath, '../myWebLogTracker.min.js'), trackerData);
    }
    // 重写加入了探针script标签(小程序require引入)的文件
    fs.writeFileSync(filePath, fileData);
  })
}

// 
exports.cleanInsertTracker = (options) => {
  const {
    file_path_arr,
  } = options;
  
  const trackerScriptTag = /;\r\nrequire\('.\/myWebLogTracker.min'\);\r\n/g;
  // 对于
  file_path_arr.forEach(filePath => {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const newFileData = fileData.replace(trackerScriptTag, '')
    if (fileData === newFileData) return;
    // 移除app.js中探针插件
    fs.writeFileSync(filePath, newFileData);
  })
}