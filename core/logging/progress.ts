import cliProgress, { MultiBar, Options, Params } from 'cli-progress'

const progress = (plugin: string): MultiBar => {
  const currentDate = (): string => {
    const dateObj = new Date()
    const month = String(dateObj.getMonth()).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const year = dateObj.getFullYear()
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')
    const milliSeconds = String(dateObj.getMilliseconds()).padStart(3, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliSeconds}Z`
  }

  function formatter(options: Options, params: Params, payload: any): string {
    const percent = Math.round((params.value / params.total) * 100)

    const length = 20

    const completeSize = Math.round(params.progress * length)
    const incompleteSize = length - completeSize
    const bar =
      (options.barCompleteString ?? '\u2588').substring(0, completeSize) +
      (options.barIncompleteString ?? '\u2591').substring(0, incompleteSize)

    const msg = `${currentDate()} [\u001b[32m${'Info'.padEnd(5)}\u001b[39m] ${`\u001b[95m${plugin}\u001b[39m`.padEnd(22)}: ${payload.task as string} [${bar}] ${percent}%`

    if (params.value >= params.total) {
      return msg + '\n'
    } else return msg
  }

  return new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: formatter,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      linewrap: false,
      stopOnComplete: true,
      forceRedraw: true
    },
    cliProgress.Presets.shades_grey
  )
}

export default progress
