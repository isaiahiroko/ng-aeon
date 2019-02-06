import { Injectable } from '@angular/core'
import { Observable ,  forkJoin } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { RemoteWrapper } from './wrappers/remote-wrapper.service'
import { Config } from './config.service'
import {
  DBColumnContract,
} from '@isaiahiroko/ng-contracts'
import { StoreContract } from '@isaiahiroko/ng-contracts'
import {
  QueryActions,
  QueryActionsContract,
} from '@isaiahiroko/ng-contracts'
import { outject } from './utils.functions'

@Injectable()
export class RemoteStore<M = any> extends RemoteWrapper
  implements StoreContract<M> {
  public config: Config
  protected exclude: string[] = [
    'status',
    'creatorId',
    'createdAt',
    'updatedAt',
  ]
  protected remoteModelName: string

  create(newItem: M): Observable<M> {
    this.config = outject(Config)
    return forkJoin(
      this.config.select<string>('store.remote.urls.APIbase'),
      (APIbase) => {
        return { APIbase, remoteModelName: this.remoteModelName }
      },
    ).pipe(
      mergeMap(({ APIbase, remoteModelName }) => {
        return this.aPost<M>(`${APIbase}/${remoteModelName}`, newItem)
      }),
    )
  }

  retrieve(queries: QueryActionsContract[] = []): Observable<M[] | M> {
    return this.query<M[] | M>(queries)
  }

  retrieveOne(queries: QueryActionsContract[] = []): Observable<M> {
    return <Observable<M>>this.retrieve([
      ...queries,
      { [QueryActions.first]: [] },
    ])
  }

  retrieveMany(queries: QueryActionsContract[] = []): Observable<M[]> {
    return <Observable<M[]>>this.retrieve([
      ...queries,
      { [QueryActions.get]: [] },
    ])
  }

  query<A = any>(
    queries: QueryActionsContract[] = [],
    append: string = '',
  ): Observable<A> {
    this.config = outject(Config)
    return forkJoin(
      this.config.select<string>('store.remote.urls.APIbase'),
      (APIbase) => {
        return { APIbase, remoteModelName: this.remoteModelName }
      },
    ).pipe(
      mergeMap(({ APIbase, remoteModelName }) => {
        let url = append
          ? `${APIbase}/${append}`
          : `${APIbase}/${remoteModelName}`
        return this.aRequest<A>(
          'GET',
          queries
            ? `${url}?query=${encodeURIComponent(JSON.stringify(queries))}`
            : url,
        )
      }),
    )
  }

  update(id: string, newItem: M): Observable<M> {
    this.config = outject(Config)
    return forkJoin(
      this.config.select<string>('store.remote.urls.APIbase'),
      (APIbase) => {
        return { APIbase, remoteModelName: this.remoteModelName }
      },
    ).pipe(
      mergeMap(({ APIbase, remoteModelName }) => {
        return this.aPut<M>(`${APIbase}/${remoteModelName}/${id}`, newItem)
      }),
    )
  }

  delete(id: string): Observable<M> {
    this.config = outject(Config)
    return forkJoin(
      this.config.select<string>('store.remote.urls.APIbase'),
      (APIbase) => {
        return { APIbase, remoteModelName: this.remoteModelName }
      },
    ).pipe(
      mergeMap(({ APIbase, remoteModelName }) => {
        return this.aDelete<M>(`${APIbase}/${remoteModelName}/${id}`)
      }),
    )
  }

  columns(): Observable<DBColumnContract[]> {
    return this.query<DBColumnContract[]>([], `${this.remoteModelName}/columns`)
  }

  length(): Observable<number> {
    return this.query<number>([{ [QueryActions.count]: [] }])
  }

  all(): Observable<M[]> {
    return this.query([{ [QueryActions.all]: [] }])
  }
}
