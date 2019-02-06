import { Injectable } from '@angular/core'

import { Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import Dexie from 'dexie'

import { StoreContract } from '@isaiahiroko/ng-contracts'
import { ClientWrapper } from './wrappers/client-wrapper.service'
import { QueryContract } from '@isaiahiroko/ng-contracts'
import { Config } from './config.service'

@Injectable()
export class ClientStore<M = any> extends ClientWrapper<M> implements StoreContract<M> {
  constructor (config: Config) {
    super(new Dexie('msq'), config)
  }

  create (newItem: M): Observable<M> {
    return this.add(newItem).pipe(
      mergeMap((newId) => {
        return this.getOne(newId)
      })
    )
  }

  retrieveOne (id: string): Observable<M> {
    return this.getOne(id)
  }

  retrieveMany (query: QueryContract): Observable<M[]> {
    return this.getMany(query.forClientStore)
  }

  update (id: string, newItem: M): Observable<M> {
    return this.add(newItem).pipe(
      mergeMap((newId) => {
        return this.getOne(newId)
      })
    )
  }

  delete (id: string): Observable<M> {
    return this.delete(id)
  }
}
