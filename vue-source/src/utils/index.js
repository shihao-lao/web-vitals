import axios from 'axios'
import { SourceMapConsumer } from 'source-map-js'

const getSourceMap = async (url) => {
  const res = await axios.get(url)
  return res.data
}

// 根据错误找源码
const findErrBySourceMap = async (stackFrame) => {
  // 获取 .map 文件
  const fileContent = await getSourceMap(
    `${stackFrame.fileName}.map`
  )

  // 解析 sourceMap
  const consumer = await new SourceMapConsumer(fileContent)

  // 查找源码位置
  const errLine = consumer.originalPositionFor({
    line: stackFrame.lineNumber,
    column: stackFrame.columnNumber
  })

  console.log(errLine)

  // 获取源码
  const code = consumer.sourceContentFor(
    errLine.source,
    true
  )

  console.log(code)

  return {
    position: errLine,
    code
  }
}

export { findErrBySourceMap }