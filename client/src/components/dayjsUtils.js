const dayjs = require('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat')
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

export default dayjs;