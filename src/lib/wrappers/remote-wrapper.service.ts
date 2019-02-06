import { HttpClient } from '@angular/common/http'

import { Observable } from 'rxjs'
import {
  map
} from 'rxjs/operators'

import { HttpOptions } from '@isaiahiroko/ng-contracts'
import {
  outject,
  untransform,
  isArray,
  transform,
  isNullOrUndefined,
  isObject,
} from '../utils.functions'

export const NORMAL_JSON_HEADER = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const FILE_JSON_HEADER = {}

export class RemoteWrapper {
  public agent: HttpClient

  aRequest<M = any>(
    method: string,
    url: string,
    payload?: Object,
    moreOptions?: HttpOptions,
    isFile: boolean = false,
  ): Observable<M> {
    this.agent = outject(HttpClient)

    // start request and hope things goes as planned
    return this.agent
      .request(method, url, {
        headers: isFile ? FILE_JSON_HEADER : NORMAL_JSON_HEADER,
        observe: 'response',
        body: isFile ? payload : JSON.stringify(untransform(payload)),
        ...moreOptions,
      })
      .pipe(
        map((response) => {
          // has errors
          if (
            !isNullOrUndefined(response.body) &&
            isNullOrUndefined(response.body['data'])
          ) {
            return response.body
          }
          // no errors
          return response.body['data']
        }),
        map((data) => {
          if (isArray(data)) {
            return data.map((d) => {
              return transform(d)
            })
          }

          if (!isObject(data)) {
            return data
          }

          return transform(data)
        }),
      )
  }

  aGet<M = any>(url: string): Observable<M> {
    return this.aRequest<M>('GET', url)
  }

  aPost<M = any>(url: string, payload: Object): Observable<M> {
    return this.aRequest<M>('POST', url, payload)
  }

  aPut<M = any>(url: string, payload: Object): Observable<M> {
    return this.aRequest<M>('PUT', url, payload)
  }

  aDelete<M = any>(url: string): Observable<M> {
    return this.aRequest<M>('DELETE', url)
  }

  aPatch<M = any>(
    url: string,
    payload: Object,
    moreOptions?: HttpOptions,
  ): Observable<M> {
    return this.aRequest<M>('PATCH', url, payload)
  }
}
