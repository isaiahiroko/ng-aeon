import { Injector, InjectionToken } from '@angular/core'
import { PortalInjector } from '@angular/cdk/portal'
import { UrlSegment, UrlSegmentGroup, Route } from '@angular/router'

import { Observable } from 'rxjs'

import { Md5 } from 'ts-md5/dist/md5'
import pluralize from 'pluralize'
import * as moment from 'moment'

export function time() {
  return moment
}

/**
 * set up a handle for injector
 * to be used to inject services without the contructor
 */
export let injector: Injector
export function setInjector(anInjector: Injector) {
  if (injector) {
    console.error('Programming error: Injector was already set')
  } else {
    injector = anInjector
  }
}

export function inject(key: any, data: any): PortalInjector {
  const injectorTokens = new WeakMap()
  injectorTokens.set(key, data)
  return new PortalInjector(injector, injectorTokens)
}

export function outject(service: any): any {
  return injector.get(service)
}

export function keys(obj: Object) {
  return Object.keys(obj)
}

export function cut(oldStr, fullStr) {
  return fullStr.split(oldStr).join('')
}

export function titleCase(
  words: string,
  seperator: string = ' ',
  joiner: string = ' ',
) {
  return words
    .split(seperator)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(joiner)
}

export function camelCase(
  words: string,
  seperator: string = '_',
  joiner: string = '',
) {
  return words
    .split(seperator)
    .map((word, i) => {
      return i == 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(joiner)
}

export function merge(...objects: Object[]): Object {
  return objects.reduce((prev, curr, index) => {
    return { ...prev, ...curr }
  }, {})
}

export function mergeToArray(...items: any[]): any[] {
  return items.reduce((prev, curr, index) => {
    return [...prev, ...curr]
  }, [])
}

export function hash(input?: string) {
  return Md5.hashStr(input ? input : Math.random().toString(), true)
}

export function plural(word: string): string {
  return pluralize(word)
}
export function singular(word: string): string {
  return pluralize.singular(word)
}

export function snakeCase(
  words: string,
  seperator: string = ' ',
  joiner: string = '_',
) {
  return (
    words
      // insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // replace space with "_"
      .replace(/ +/g, '_')
      // lowercase everything
      .toLowerCase()
  )
}

export function isNumeric(str: string) {
  return !isNullOrUndefined(str) && /^\d+$/.test(str)
}

export function isNullOrUndefined(value: any) {
  return value === undefined || value === null
}

export function isUndefined(value: any) {
  return value === undefined
}

export function isBlankString(value: any) {
  return value === ''
}

export function isFunction(value: any) {
  return typeof value === 'function'
}

export function isObject(x: any) {
  return x != null && typeof x === 'object'
}

export function isArray(x: any) {
  return x != null && typeof x === 'object' && Array.isArray(x)
}

export function toJSON(mayBeJSON: string, returnJSON: boolean = false) {
  try {
    let obj = JSON.parse(mayBeJSON)
    if (obj && typeof obj === 'object') {
      return returnJSON ? obj : true
    }
  } catch (e) {}
  return false
}

export const AUTO_JSON_CONFIG = new InjectionToken<Object>('auto.json.config')
export function transform<M = any>(datum: any): M {
  let AUTO_JSON_COLUMNS = outject(AUTO_JSON_CONFIG) || []
  if (!datum || isNullOrUndefined(datum) || isBlankString(datum)) {
    return datum
  }
  let d = {}
  for (var key in datum) {
    if (datum.hasOwnProperty(key)) {
      d = {
        ...d,
        [camelCase(key)]:
          AUTO_JSON_COLUMNS.includes(key) && toJSON(datum[key])
            ? JSON.parse(datum[key])
            : datum[key],
      }
    }
  }
  return <M>d
}

export function untransform(datum): Object {
  let AUTO_JSON_COLUMNS = outject(AUTO_JSON_CONFIG) || []
  if (!datum || isNullOrUndefined(datum) || isBlankString(datum)) {
    return datum
  }
  let d = {}
  for (var key in datum) {
    if (datum.hasOwnProperty(key)) {
      d = {
        ...d,
        [snakeCase(key)]:
          AUTO_JSON_COLUMNS.includes(key) && isObject(datum[key])
            ? JSON.stringify(datum[key])
            : datum[key],
      }
    }
  }
  return d
}

export type compareType = string | 'string' | 'number' | 'time'
export function compare(a, b, isAsc: boolean, type: compareType) {
  if (typeof a === 'string' && type === 'string') {
    return a.localeCompare(b) * (isAsc ? 1 : -1)
  }

  if (typeof a === 'number' && type === 'number') {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
  }

  if (typeof a === 'string' && type === 'time') {
    return (
      (new Date(a).getTime() < new Date(b).getTime() ? -1 : 1) *
      (isAsc ? 1 : -1)
    )
  }
}

export function routeGroupMatcher(haystack: string[]) {
  return (
    segments: UrlSegment[],
    segmentGroup: UrlSegmentGroup,
    route: Route,
  ) => {
    return segments.length === 1 &&
      haystack.includes(segments[0].path.toLowerCase())
      ? { consumed: segments }
      : null
  }
}

export function numberWithCommas(number: number): string {
  if(isNullOrUndefined(number)){
    return '0'
  }
  var parts = number.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// console.log(objectGroupBy(['one', 'two', 'three'], 'length'));
// => {3: ["one", "two"], 5: ["three"]}
// key can be a sort callback function
// todo: nice es6 typings function<TItem>(xs: TItem[], key: string) : {[key: string]: TItem[]} {
export function objectGroupBy(input: any[], key: any): Object {
  return input.reduce((prev, curr) => {
    var newKey =
      key instanceof Function
        ? key(curr)
        : curr[key]((prev[curr[newKey]] = prev[curr[newKey]] || [])).push(curr)
    return prev
  }, {})
}

export function arrayGroupBy(input: any[], key: any): any[] { 
  if(isNullOrUndefined(input) || input.length < 1){
    return []
  }

  return input.reduce((prev, curr) => { 
    
    if(isNullOrUndefined(curr) || curr.length < 1){
      return prev
    }  

    let v = key instanceof Function ? key(curr) : curr[key]
    let el = prev.find((r) => r && r.key === v)
    if (el) {
      el.values.push(curr)
    } else {
      prev.push({ key: v, values: [curr] })
    }
    return prev
  }, [])
}

export function objectDeepMerge(input: Object[]): Object {
  return input.reduce((prev, curr) => {
    for (const key in curr) {
      if (curr.hasOwnProperty(key)) {
        prev[key] = [...(prev[key] || []), curr[key]]
      }
    }
    return prev
  }, {})
}

export function randomString(length: number = 7) {
  length = 2 + length / 2
  return (
    Math.random()
      .toString(36)
      .substring(2, length) +
    Math.random()
      .toString(36)
      .substring(2, length)
  )
}

export function isObservable(mayBeObservable: any): boolean {
  return mayBeObservable instanceof Observable
}

export function copy(obj: Object): Object {
  return JSON.parse(JSON.stringify(obj))
}

export function deepCopy(input: Object | Object[] ): Object{
  if(isArray(input)){
    return input['map'](i => deepCopy(i))
  }
  else if(isObject(input)){
    let output = {};
    for (const property in input) {
        if (input.hasOwnProperty(property)) {
            output[property] = deepCopy(input[property])
        }
    }
    return output
  }
  else{
    return input
  }
}