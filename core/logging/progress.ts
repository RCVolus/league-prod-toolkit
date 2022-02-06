import cliProgress, { MultiBar } from 'cli-progress'

const dateObj = new Date()
const month = String(dateObj.getMonth()).padStart(2, '0')
const day = String(dateObj.getDate()).padStart(2, '0')
const year = dateObj.getFullYear()
const hours = String(dateObj.getHours()).padStart(2, '0')
const minutes = String(dateObj.getMinutes()).padStart(2, '0')
const seconds = String(dateObj.getSeconds()).padStart(2, '0')
const milliSeconds = String(dateObj.getMilliseconds()).padStart(4, '0')
const output = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}.${milliSeconds}Z`

function formatter (plugin: string): string {
  return `${output} [\u001b[32m${'Info'.padEnd(5)}\u001b[39m] ${`\u001b[95m${plugin}\u001b[39m`.padEnd(
    22
  )}: [{bar}] {percentage}% | {value}/{total}`
}

const progress = (plugin: string): MultiBar => new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: formatter(plugin)
}, cliProgress.Presets.shades_grey)

export default progress
