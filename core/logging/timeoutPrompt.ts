import ConfirmPrompt from 'inquirer/lib/prompts/confirm'
import type inquirer from 'inquirer'

type options = inquirer.prompts.PromptOptions & {
  timeout?: number
  timeoutTips: (t: number) => string
}

export class TimeoutConfirmPrompt extends ConfirmPrompt {
  private timeout: number = 0

  declare opt: options
  constructor (...args: any[]) {
    // @ts-expect-error arg spread
    super(...args)
    this.opt.timeoutTips = t => `(${t}s)`
    this.opt.timeout = this.opt.timeout ?? 10
  }

  _run (cb: (...args: any) => void): void {
    this.timeout = this.opt.timeout ?? 10
    const timerId = setInterval(() => {
      this.timeout -= 1
      if (this.timeout === 0) {
        clearInterval(timerId)
        this.onEnd(this.opt.default === 'Y/n' ? 'Yes' : 'No')
      } else {
        this.render()
      }
    }, 1000)

    /* eslint-disable-next-line */
    return super._run((...args) => {
      clearInterval(timerId)
      // eslint-disable-next-line n/no-callback-literal
      cb(...args)
    })
  }

  render (answer?: boolean | undefined): this {
    let message = this.getQuestion()

    if (this.timeout !== 0 && answer === undefined) {
      message += this.opt.timeoutTips(this.timeout ?? 10)
    }

    if (typeof answer === 'boolean') {
      message += answer ? 'Yes' : 'No'
    } else {
      message += this.rl.line
    }

    this.screen.render(message, '')
    return this
  }
}
