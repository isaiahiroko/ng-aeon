import { Injectable } from '@angular/core'

import {RuleContract } from '@isaiahiroko/ng-contracts'
import { ConditionContract} from '@isaiahiroko/ng-contracts'
import { FilterContract} from '@isaiahiroko/ng-contracts'
import {  
  QueryContract,
  QueryActions,
  QueryActionsContract } from '@isaiahiroko/ng-contracts'
import { isNullOrUndefined } from './utils.functions'

@Injectable()
export class Query {
    static readonly Actions = QueryActions;

    fromQueryParam (queries: string): QueryActionsContract[] {
      if (isNullOrUndefined(queries)) {
        return []
      }
      let qa: QueryActionsContract[] = []
      decodeURIComponent(queries).split('&').forEach((query) => {
        let queryParts = query.split(':')
        if (queryParts.length >= 2 || queryParts.length <= 3) {
          qa.push({ [Query.Actions.where]: queryParts })
        }
      })
      return qa
    }

    conditions: ConditionContract = {};
    filters: FilterContract[] = [];

    init (
      conditions: ConditionContract = {},
      filters: FilterContract[] = []
    ) {}

    /**
     * alias for **stringify**
     * @param perPage
     * @param pageNumber
     */
    getString (perPage:number = 12, pageNumber: number = 1): string {
      return this.stringify(perPage, pageNumber)
    }
    stringify (perPage:number = 12, pageNumber: number = 1): string {
      return JSON.stringify(this.make(perPage, pageNumber))
    }

    /**
     * alias for **objectify**
     * @param perPage
     * @param pageNumber
     */
    getObject (perPage:number = 12, pageNumber: number = 1): QueryContract {
      return this.objectify(perPage, pageNumber)
    }
    objectify (perPage:number = 12, pageNumber: number = 1): QueryContract {
      return this.make(perPage, pageNumber)
    }

    getConditions (): ConditionContract {
      return this.conditions
    }

    getFilters (): FilterContract[] {
      return this.filters
    }

    make (perPage:number, pageNumber: number): QueryContract {
      return {
        conditions: this.conditions,
        filters: (this.filters)
          ? this.filters
          : [
            { order: ['id', 'description']},
            { limit: perPage },
            { offset: perPage * (pageNumber - 1) }
          ]
      }
    }

    addRule (rules: RuleContract[], operator: string): Query {
      this.conditions = {...this.conditions, ...{ [operator]: rules}}
      return this
    }

    addFilter (filters: FilterContract[]): Query {
      this.filters = [...this.filters, ...filters]
      return this
    }

    start (rules: RuleContract[]): Query {
      this.and(rules)
      return this
    }

    and (rules: RuleContract[]): Query {
      this.addRule(rules, 'and')
      return this
    }

    or (rules: RuleContract[]): Query {
      this.addRule(rules, 'or')
      return this
    }

    date (rules: RuleContract[]): Query {
      this.addRule(rules, 'date')
      return this
    }

    day (rules: RuleContract[]): Query {
      this.addRule(rules, 'day')
      return this
    }

    month (rules: RuleContract[]): Query {
      this.addRule(rules, 'month')
      return this
    }

    year (rules: RuleContract[]): Query {
      this.addRule(rules, 'year')
      return this
    }

    order (filter: FilterContract): Query {
      this.addFilter([filter])
      return this
    }

    limit (filter: FilterContract): Query {
      this.addFilter([filter])
      return this
    }

    page (filter: FilterContract): Query {
      this.addFilter([filter])
      return this
    }

    offset (filter: FilterContract): Query {
      this.addFilter([filter])
      return this
    }
}

/**
 * Sample Query:
 * {
 *  'and' => [
 *      {
 *             'key' => 'id',
 *              'operator' => '>',
 *              'value' => '7'
 *          },{
 *              'key' => 'name',
 *              'operator' => 'LIKE',
 *              'value' => '%isa%'
 *          }
 *      ],
 *  'or' => [
 *          {
 *              'key' => 'id',
 *              'operator' => '>',
 *              'value' => '2'
 *          },{
 *              'key' => 'name',
 *              'operator' => 'LIKE',
 *              'value' => '%iah%'
 *          }
 *      ]
 *  }
 *
 *
            filters: [{
                'order': ['column', 'value']
            },{
                'offset': 'number'
            },{
                'limit': 'number'
        }]
 */
