import { Injectable } from '@angular/core'
import { Observable ,  of } from 'rxjs'
import { WebWrapper } from './wrappers/web-wrapper.service'
import { StoreContract} from "@isaiahiroko/ng-contracts";
import { QueryContract } from '@isaiahiroko/ng-contracts'
import { Config } from './config.service'

@Injectable()
export class SessionStore<M = any> extends WebWrapper<M> implements StoreContract<M> {
  constructor (config: Config) {
    super(sessionStorage, config)
    this.config.select<Object>('store.session.initialValues').subscribe((initialValues) => {
      this.create(initialValues)
    })
  }

  /**
     * Creates a new localStore item
     * @param newItem Object key is the store id, and value is the store value
     * Sample: { userId: 71 }, { user: { name, email }}, { userId: 71, user: { name, email } }
     */
  create (newItem: Object): Observable<M> {
    return of(...this.set(newItem))
  }

  /**
     *
     * @param id
     */
  retrieveOne (id: string): Observable<M> {
    return of(...this.get(id))
  }

  /**
     *
     * @param query
     */
  retrieveMany (query: QueryContract): Observable<M[]> {
    return of(this.get(query.forWebStore))
  }

  /**
     *
     * @param id
     * @param newItem
     */
  update (id: string, newValue: any): Observable<M> {
    return of(...this.set({ [id]: newValue}))
  }

  /**
     *
     * @param id
     */
  delete (id: string): Observable<M> {
    return of(...this.remove(id))
  }
}
