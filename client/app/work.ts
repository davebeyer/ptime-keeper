/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}          from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'work-block'
})

@View({
    template: `
        <h1> Work!</h1>
        `
})

export class Work {

    constructor() {
        console.log("work.ts: in constructor")
    }
}
