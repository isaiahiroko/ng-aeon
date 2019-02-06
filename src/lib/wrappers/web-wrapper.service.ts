import { Config } from '../config.service'
import { toJSON } from '../utils.functions'

export class WebWrapper<M = any> {
    protected StoreKeys: string[] = [];

    constructor (protected agent: Storage, protected config: Config) {}

    public get (key?: string): M[] {
      return (key)
        ? (toJSON(this.agent.getItem(key))) 
          ? [toJSON(this.agent.getItem(key), true)] 
            : null
        : this.StoreKeys.map((key) => {
          return JSON.parse(this.agent.getItem(key))
        })
    }

    public set (keyOrKeyValue: string | Object, value?: any): M[] {
      keyOrKeyValue = (typeof keyOrKeyValue === 'string') ? {
        keyOrKeyValue: value
      } : keyOrKeyValue
      let items: M[] = []
      for (const key in keyOrKeyValue) {
        if (keyOrKeyValue.hasOwnProperty(key)) {
          this.agent.setItem(key, JSON.stringify(keyOrKeyValue[key]))
          this.StoreKeys.push(key)
          items.push(keyOrKeyValue[key])
        }
      }

      return items
    }

    public remove (keyOrKeys: string | string[]): M[] {
      let removed: M[]

      keyOrKeys = (typeof keyOrKeys === 'string') ? [keyOrKeys] : keyOrKeys

      keyOrKeys.forEach((key) => {
        removed.push(...this.get(key))
        this.agent.removeItem(key)
      })

      return removed
    }

    public clear (): M[] {
      this.agent.clear()
      return this.get()
    }
}
