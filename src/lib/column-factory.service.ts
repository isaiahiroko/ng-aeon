import { Injectable } from '@angular/core'
import { ValidatorFn, Validators } from '@angular/forms'

import { Observable,  of,  combineLatest } from 'rxjs'
import {
  mergeMap,
  map,
} from 'rxjs/operators'


import { RemoteStore } from './remote-store.service'
import { plural, titleCase, outject } from './utils.functions'
import {
  ColumnContract,
  DBColumnContract,
} from '@isaiahiroko/ng-contracts'
import { QueryActions } from '@isaiahiroko/ng-contracts'

import { FormContract, FiltersFormContract, JSONContract } from '@isaiahiroko/ng-contracts'
import { Config } from './config.service'

export interface FormConfig extends JSONContract{
  disabled?: string[]
  defaults?: JSONContract
  hidden?: string[]
}

export interface FormFilterConfig extends JSONContract{

}

@Injectable()
export class ColumnFactory {
  private _columnsMap: {
    [name: string]: ColumnContract
  }
  private _columns: ColumnContract[]
  private _dbName: string
  private _tableName: string
  private _description: string
  private _stringTypes = [
    'char',
    'varchar',
    'binary',
    'varbinary',
    'tinytext',
    'mediumtext',
    'longtext',
    'text',
    'enum',
    'set',
    'tinyblob',
    'mediumblob',
    'longblob',
    'blob',
    'json',
  ]
  private _numberTypes = [
    'int',
    'tinyint',
    'smallint',
    'mediumint',
    'integer',
    'bigint',
    'decimal',
    'dec',
    'float',
    'double',
  ]
  private _booleanTypes = ['boolean', 'bool']
  private _timeTypes = ['date', 'datetime', 'time']
  private _JSONtypes = ['json']
  private _exclude = ['id', 'created_at', 'updated_at', 'deleted_at']

  constructor(private remote: RemoteStore) {}

  from(columns: DBColumnContract[]) {
    if (columns.length > 0) {
      this._dbName = columns[0].tableSchema
      this._tableName = columns[0].tableName
      this._description = columns[0].tableComment
    }

    this._columns = this.transform(
      columns.filter((column) => !this._exclude.includes(column.columnName)),
    )

    this._columnsMap = this._columns.reduce((prev, curr) => {
      return { ...prev, [curr.originalName]: curr }
    }, {})

    return this
  }

  toForm(resource: Object = {}, config: FormConfig = null): FormContract {
    return {
      fields: this._columns.map((column) => {  
      return { 
          ...column.field, 
          ...((config && config.hidden && config.hidden.includes(column.field.key)) ? { hide: true } : {}),
          ...((config && config.defaults && config.defaults[column.field.key]) ? { defaultValue: config.defaults[column.field.key] } : {}),
          // ...((config && config.disabled && config.disabled.includes(column.field.key)) ? {disabled: true} : {}) 
        }
      }),
      title: this.tableName() + ' Form',
      description: this.tableDescription(),
      resource: { ...(config ? config.defaults : {}), ...resource },
    }
  }

  toFiltersForm(config: Object): Observable<FormContract> {
    return combineLatest(...this.toFilter(config)).pipe(
      map((filters) => {
        return {
          fields: filters.map((filter) => {
            return {
              key: filter.title,
              type: filter.type,
              templateOptions: {
                type: filter.type,
                label: this.inputLabel(filter.title),
                placeholder: filter.title,
                required: false,
                options: filter.options,
              },
              ...filter.attributes,
            }
          }, {}),
          title: this.tableName() + ' Form',
          description: this.tableDescription(),
          resource: {},
        }
      }),
    )
  }

  toFilter(config: Object): Observable<FiltersFormContract>[] {
    const appConfig: Config = outject(Config)
    return [
      // enums columns
      ...this.enumColumns().map((column) => {
        return of({
          title: column.name,
          type: 'select', // 'string',
          options: column.options,
        })
      }),

      // ids
      ...this.idColumns().filter((column) => column.originalName.endsWith('_id')).map((column) => {
        let RemoteTableName = plural(
          column.originalName.substr(0, column.originalName.length - 3),
        )
        return appConfig.select<string>('store.remote.urls.APIbase').pipe(
          mergeMap((APIbase) => {
            return this.remote.aGet(
              `${APIbase}/${RemoteTableName}?query=${encodeURIComponent(
                // JSON.stringify([{ [QueryActions.get]: [['id', 'title']] }]),
                JSON.stringify([{ [QueryActions.get]: [] }]),
              )}`,
            )
          }),
          map((data: any[]) => {
            return {
              title: column.name,
              type: 'select', // 'string',
              values: data.map((d) => {
                return {
                  label: this.remoteRowTitle(d),
                  value: d['id'],
                }
              }),
            }
          }),
        ) //pluck column from table
      }),

      // number
      ...this.numberColumns().map((column) => {
        let RemoteTableName = plural(this.tableName())
        let RemoteColumnName = column.originalName
        return appConfig.select<string>('store.remote.urls.APIbase').pipe(
          mergeMap((APIBase) => {
            return combineLatest(
              this.remote.aGet<number>(
                `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(
                  JSON.stringify([{ [QueryActions.min]: [RemoteColumnName] }]),
                )}`,
              ),
              this.remote.aGet<number>(
                `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(
                  JSON.stringify([{ [QueryActions.max]: [RemoteColumnName] }]),
                )}`,
              ),
            )
          }),
          map(([min, max]) => {
            return {
              title: column.name,
              type: 'slider', // 'number',
              attributes: { min, max },
            }
          }),
        ) //this.agent.aGet(``) //get min and max values from a column: [res['min'], res['max']]
      }),

      // time
      ...this.timeColumns().map((column) => {
        let RemoteTableName = plural(this.tableName())
        let RemoteColumnName = plural(
          column.originalName.substr(0, column.originalName.length - 3),
        )
        return appConfig.select<string>('store.remote.urls.APIbase').pipe(
          mergeMap((APIBase) => {
            return combineLatest(
              this.remote.aGet<number>(
                `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(
                  JSON.stringify([{ [QueryActions.min]: [RemoteColumnName] }]),
                )}`,
              ),
              this.remote.aGet<number>(
                `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(
                  JSON.stringify([{ [QueryActions.max]: [RemoteColumnName] }]),
                )}`,
              ),
            )
          }),
          map(([min, max]) => {
            return {
              title: column.name,
              type: 'datepicker', // 'number',
              attributes: { min, max },
            }
          }),
        ) //this.agent.aGet(``) //get min and max values from a column: [res['min'], res['max']]
      }),

      // boolean
      ...this.booleanColumns().map((column) => {
        return of({
          title: column.name,
          type: 'toggle',
        })
      }),

      // json
      ...this.JSONColumns().map((column) => {
        let RemoteTableName = plural(this.tableName())
        let RemoteColumnName = plural(
          column.originalName.substr(0, column.originalName.length - 3),
        )
        return appConfig.select<string>('store.remote.urls.APIbase').pipe(
          mergeMap((APIBase) => {
            return this.remote.aGet<any[]>(
              `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(
                JSON.stringify([{ [QueryActions.get]: [[RemoteColumnName]] }]),
              )}`,
            )
          }),
          map((meta) => {
            let nMeta = meta['reduce']((prev, curr) => {
              let nCurr = Object.keys(curr).map((k) => {
                return { [k]: [...(prev[k] || []), ...curr[k]] }
              })
              return { ...prev, ...nCurr }
            }, {})
            return {
              title: column.name,
              // type: 'datepicker',
              attributes: {
                fieldGroup: Object.entries(nMeta).map(([key, values]) => {
                  return {
                    title: column.name,
                    type: 'select',
                    options: values['map']((v) => {
                      return {
                        value: v,
                        label: v,
                      }
                    }),
                    multiple: true,
                  }
                }),
              },
            }
          }),
        ) // this.agent.aGet(``) //merge column key values iterativelly
      }),
    ]
  }

  // toTypeCards(config?: Object): Observable<CardContract[][]>{
  //   const appConfig: Config = outject(Config)
  //   let RemoteTableName = plural(this.tableName())
  //   return forkJoin(...[...this.enumColumns().map((column) => {
  //     return column.fullType
  //       .replace("enum('", '')
  //       .replace("')", '')
  //       .split("','")
  //       .map((value) => {
  //         return value
  //       })
  //     }), ...[[RemoteTableName]]].map((typeGroup) => {
  //       return forkJoin(...typeGroup.map((type) => {
  //         return appConfig.select<string>('store.remote.urls.APIbase').pipe(
  //           mergeMap((APIBase) => {
  //             if(type == RemoteTableName){
  //               return this.remote.aGet<number>(
  //                 `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(JSON.stringify([{ [QueryActions.count]: [] }]))}`
  //               )
  //             }
  //             return this.remote.aGet<number>(
  //               `${APIBase}/${RemoteTableName}?query=${encodeURIComponent(JSON.stringify([
  //                 { [QueryActions.where]: ['type', '=', type] }, 
  //                 { [QueryActions.count]: [] }
  //               ]))}`
  //             )
  //           }),
  //           map((count) => {
  //             return <CardContract> {
  //               title: 'Total ' + plural(type).toUpperCase(), 
  //               bold: count,
  //               actions: [{
  //                 icon: 'arrow_forward',
  //                 url : '/' + singular(RemoteTableName.toLowerCase()),
  //                 queryParams: (type == RemoteTableName) ? {} : { query: encodeURIComponent(`type:=:${type}`) }
  //               }]
  //             }
  //           })
  //         )
  //       }))
  //     })
  //   )
  // }

  dbName(): string {
    return this._dbName.replace(/_/g, ' ')
  }

  tableName(): string {
    return this._tableName.replace(/_/g, ' ')
  }

  columnNames(): string[] {
    return Object.keys(this._columnsMap)
  }

  getColumnByName(name: string): ColumnContract {
    return this._columnsMap[name]
  }

  private enumColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return column.fullType.includes('enum')
    })
  }

  private idColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return column.originalName.includes('_id')
    })
  }

  private stringColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return this._stringTypes.includes(column.type)
    })
  }

  private numberColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return this._numberTypes.includes(column.type)
    })
  }

  private booleanColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return this._booleanTypes.includes(column.type)
    })
  }

  private JSONColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return this._JSONtypes.includes(column.type)
    })
  }

  private timeColumns(): ColumnContract[] {
    return this._columns.filter((column) => {
      return this._timeTypes.includes(column.type)
    })
  }

  private transform(columns: DBColumnContract[]): ColumnContract[] {
    return columns.map((column) => {
      return {
        name: this.name(column),
        originalName: column.columnName,
        position: this.position(column),
        default: this.default(column),
        isRequired: this.isRequired(column),
        type: this.type(column),
        maxLength: this.maxLength(column),
        comment: this.comment(column),
        fullType: this.fullType(column),
        field: {
          key: column.columnName,
          type: this.controlType(column),
          templateOptions: {
            type: this.inputType(column),
            label: this.inputLabel(this.name(column)),
            description: this.controlDescription(column),
            placeholder: this.placeholder(column),
            required: this.isRequired(column),
            options: this.options(column),
            cols: 10,
            rows: 10,
          },
        },
        options: this.options(column),
        rules: this.rules(column),
        controlType: this.controlType(column),
        inputType: this.inputType(column),
        placeholder: this.placeholder(column),
      }
    })
  }

  private name(column: DBColumnContract): string {
    return column.columnName.replace(/_/g, ' ')
  }

  private position(column: DBColumnContract): number {
    return +column.ordinalPosition
  }

  private default(column: DBColumnContract): string {
    return column.columnDefault ? column.columnDefault : ''
  }

  private isRequired(column: DBColumnContract): boolean {
    return column.isNullable == 'NO'
  }

  private type(column: DBColumnContract): string {
    return column.dataType ? column.dataType.toLowerCase() : ''
  }

  private maxLength(column: DBColumnContract): number {
    return +column.characterMaximumLength
  }

  private comment(column: DBColumnContract): string {
    return column.columnComment ? column.columnComment : ''
  }

  private fullType(column: DBColumnContract): string {
    return column.columnType ? column.columnType : ''
  }

  private options(column: DBColumnContract): any[] {
    // if column type is enum
    // retrieve enum values and turn to array
    // "enum('event','activity','report')"
    if (column.columnType && column.columnType.includes('enum')) {
      return column.columnType
        .replace("enum('", '')
        .replace("')", '')
        .split("','")
        .map((value) => {
          return {
            label: value,
            value: value,
          }
        })
    }

    return []
  }

  private rules(column: DBColumnContract): ValidatorFn {
    return Validators.compose([
      this.isRequired(column) ? Validators.required : null,
      column.characterMaximumLength
        ? Validators.maxLength(+column.characterMaximumLength)
        : null,
      column.numericPrecision
        ? Validators.maxLength(+column.numericPrecision)
        : null,
    ])
  }

  private controlType(column: DBColumnContract): string {
    let commentItems = column.columnComment.split(':')
    let type = commentItems.length > 0 ? commentItems[0] : 'input'
    if (type.includes('radio-boolean')) {
      return 'radio-boolean'
    }
    let subType = type.split('-')
    return subType.length > 0 ? subType[0] : 'input'
  }

  private inputType(column: DBColumnContract): string {
    let commentItems = column.columnComment.split(':')
    let type = commentItems.length > 0 ? commentItems[0] : 'input'
    let subType = type.split('-')
    return subType.length > 1 ? subType[1] : 'text'
  }

  private placeholder(column: DBColumnContract): string {
    return this.controlType(column) == 'input'
      ? 'Enter ' + titleCase(column.columnName)
      : ''
  }

  private controlDescription(column: DBColumnContract): string {
    let commentItems = column.columnComment.split(':')
    return commentItems.length > 1 ? commentItems[1] : ''
  }

  private tableDescription(): string {
    return this._description
  }

  private inputLabel(label: string){
    return (label.endsWith(' id')) ? titleCase(label.slice(0, -3)) : titleCase(label)
  }
  
  private remoteRowTitle(row: Object){
    return (row['firstName'] && row['lastName']) ? row['firstName'] + ' ' + row['lastName'] : row['name'] || row['title'] || row['description'] || row['summary']
  }

}