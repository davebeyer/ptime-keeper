/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}          from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'history-block'
})

@View({
    template: `
        <h1> History</h1>
        `
})

export class History {

    constructor() {
        console.log("history.ts: in constructor")
    }
}
