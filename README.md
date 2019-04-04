# NG AEON

## Introduction
Aeon defines a common interface for data stores, and includes implementation for localStorage, sessionStorage, indexedDB and remote stores (through APIs).

## Common Store Interface
```
    create(newItem: M): Observable<M>;
   
    retrieveOne(queries: QueryActionsContract[] | string): Observable<M>;
   
    retrieveMany(queries: QueryActionsContract[] | QueryContract): Observable<M[]>;
   
    update(id: string, newItem: M): Observable<M>;
   
    delete(id: string): Observable<M>;

```

## Dependencies
```
    "@angular/common": "^6.0.0-rc.0 || ^6.0.0",
    "@angular/core": "^6.0.0-rc.0 || ^6.0.0",
    "@angular/cdk": "^7.3.1",
    "@isaiahiroko/ng-contracts": "0.0.2",
    "dexie": "^2.0.1",
    "moment": "^2.24.0",
    "pluralize": "^7.0.0",
    "ts-md5": "^1.2.4"
```

## Install
```
$ npm i ng-aeon
```

## Usage

### Local Store
This is a wrapper around localStorage that implements Aeon's Store interface.

```
//app.module.ts
//import package
import { LocalStore } from 'isaiahiroko/ng-aeon';

//add to list of providers in your app module 
//or any other module for scoped usage
@NgModule({
    ...
    providers: [LocalStore],
    ...
})
export class AppModule {
  constructor() {}
}

//xyz.component.ts
import { LocalStore } from 'isaiahiroko/ng-aeon';

export class XYZComponent{

    constructor(private local: LocalStore) {
        //add to localStorage
        this.local.create({ appName: 'my app name' }).subscribe((appName) => {
            //do something with appName
        })


        //retrieve from localStorage
        this.appName = this.local.get('appName')
        //or
        this.local.retrieveOne('appName').subscribe((appName) => {
            //do something with appName
        })

        //update data in localStorage
        this.local.update('appName', { short: 'MAN', long: 'my app name' }).subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })


        //delete from localStorage
        this.local.remove('appName').subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })

    }    

}

```

### Session Store

This is a wrapper around sessionStorage that implements Aeon's Store interface. 

```

//app.module.ts
//import package
import { SessionStore } from 'isaiahiroko/ng-aeon';

//add to list of providers in your app module 
//or any other module for scoped usage
@NgModule({
    ...
    providers: [SessionStore],
    ...
})
export class AppModule {
  constructor() {}
}

//xyz.component.ts
import { SessionStore } from 'isaiahiroko/ng-aeon';

export class XYZComponent{

    constructor(private session: SessionStore) {
        //add to sessionStorage
        this.session.create({ appName: 'my app name' }).subscribe((appName) => {
            //do something with appName
        })


        //retrieve from sessionStorage
        this.appName = this.session.get('appName')
        //or
        this.session.retrieveOne('appName').subscribe((appName) => {
            //do something with appName
        })

        //update data in sessionStorage
        this.session.update('appName', { short: 'MAN', long: 'my app name' }).subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })


        //delete from sessionStorage
        this.session.remove('appName').subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })

    }    

}

```

## Client Store

This is a wrapper around IndexedDB that implements Aeon's Store interface. 

```

//app.module.ts
//import package
import { ClientStore } from 'isaiahiroko/ng-aeon';

//add to list of providers in your app module 
//or any other module for scoped usage
@NgModule({
    ...
    providers: [ClientStore],
    ...
})
export class AppModule {
  constructor() {}
}

//xyz.component.ts
import { ClientStore } from 'isaiahiroko/ng-aeon';

export class XYZComponent{

    constructor(private clientStore: ClientStore) {
        //add to IndexedDB
        this.clientStore.create({ appName: 'my app name' }).subscribe((appName) => {
            //do something with appName
        })


        //retrieve from IndexedDB
        this.appName = this.clientStore.get('appName')
        //or
        this.clientStore.retrieveOne('appName').subscribe((appName) => {
            //do something with appName
        })

        //update data in IndexedDB
        this.clientStore.update('appName', { short: 'MAN', long: 'my app name' }).subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })


        //delete from IndexedDB
        this.clientStore.remove('appName').subscribe((appName) => {
            //do something with appName
            this.appName = appName
        })

    }    

}
```

## Remote Store
[TODO]

## [Licence](./LICENCE.md)