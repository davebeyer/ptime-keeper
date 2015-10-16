/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}          from 'angular2/angular2';
import {RouterLink}               from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'signin'
})

@View({
    directives: [RouterLink],

    template: `
        <h1> Please sign in </h1>
        `
})

export class SignIn {

    constructor() {
        console.log("signin.ts: in constructor")
    }
}
