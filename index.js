const { validateAndGenenateOption, getTrackerFile, setWXMPTracker, fwarn, cleanInsertTracker } =  require ('./src/utils');

module.exports = (ctx, config) => {
  // 校验生成参数
  const options = validateAndGenenateOption(config);
  if (ctx.runOpts.platform === 'weapp') {
    try {
      // 参数校验失败,直接跳过
      if (!options.available) {
        return 
      }
      ctx.onBuildStart(async () => {
        cleanInsertTracker(options)
        // 获取探针文件
        const trackerData = await getTrackerFile(options);
        if (trackerData.length) {
          await setWXMPTracker(trackerData, options);
        }
      })
      if (!ctx.runOpts.isWatch) {
        ctx.onBuildFinish(() => {
          // 清楚探针引入代码
          cleanInsertTracker(options)
        })
      }
    } catch(e) {
      fwarn(e);
    }
  } else {
    // 参数校验失败,直接跳过
    if (!options.available) {
      return 
    }
    cleanInsertTracker(options)
  }
}