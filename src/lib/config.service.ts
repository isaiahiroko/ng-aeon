import { Injectable, Inject, InjectionToken, Optional } from '@angular/core'

import { Observable ,  of } from 'rxjs'

export const CONFIG_DATA = new InjectionToken<Object>('config.data')

@Injectable()
export class Config {
  constructor(@Inject(CONFIG_DATA) private config: Object) {}

  /**
   * select('app.brand.name')
   * @param key
   */
  select<T = any>(key: string): Observable<T> {
    let keys: string[] = key.split('.')
    let rst: Object = this.config
    keys.forEach(function(k) {
      rst = rst && rst[k] ? rst[k] : null
    })
    return of(<T>rst)
  }

  /**
   * Synchronous version
   * select('app.brand.name')
   * @param key
   */
  pick<T = any>(key: string): T {
    let keys: string[] = key.split('.')
    let rst: Object = this.config
    keys.forEach(function(k) {
      rst = rst && rst[k] ? rst[k] : null
    })
    return <T>rst
  }
}

// { provide: CONFIG_DATA, useValue: {
//     foundation: { ...DEFAULT_CONFIG, ...CUSTOM_CONFIG, ...ANOTHER_CONFIG }
// } }
