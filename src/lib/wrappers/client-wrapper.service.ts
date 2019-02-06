import { Observable,  from as fromPromise } from 'rxjs'
import { mergeMap,  tap ,  map } from 'rxjs/operators'

import { Dexie } from 'dexie'

import { Config } from '../config.service'

export interface ClientStoreConfigContract{
    [key: string]: string;
}

export class ClientWrapper<M = any> {
    table: Dexie.Table<M, number>;
    tableName: string;

    constructor (protected agent: Dexie, protected config: Config) {}

    go (): Observable<ClientWrapper<M>> {
      return this.config.select<ClientStoreConfigContract>('store.client.schema')
        .pipe(
          tap((schema) => {
            this.agent.version(1).stores(schema)
            // this.agent.open();
            this.table = this.agent.table(this.tableName)
          }),
          map((schema) => {
            return this
          })
        )
    }

    getAll () {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.toArray())
          })
        )
    }

    getMany (query: { [key: string]: string }) {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.where(query).toArray())
          })
        )
    }

    getOne (id) {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.where({ id }).first())
          })
        )
    }

    add (data) {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.add(data))
          })
        )
    }

    updateData (id, data) {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.update(id, data))
          })
        )
    }

    remove (id) {
      return this.go()
        .pipe(
          mergeMap((thisClient) => {
            return fromPromise(thisClient.table.delete(id))
          })
        )
    }
}
