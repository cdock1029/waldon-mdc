import glob from 'glob'

const flat = require('array.prototype.flat')
flat.shim()

const files = glob.sync('./**/*.function.js', {
  cwd: __dirname,
  ignore: './node_modules/**',
})

for (const file of files) {
  const functionName = file
    .split('/')
    .pop()!
    .slice(0, -12) // remove '.function.js'
  if (
    !process.env.FUNCTION_NAME ||
    process.env.FUNCTION_NAME === functionName
  ) {
    exports[functionName] = require(file)
  }
}
