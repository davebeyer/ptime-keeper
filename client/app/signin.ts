/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

require("firebase");

import {Component, View}          from 'angular2/angular2';
import {RouterLink}               from 'angular2/router';

declare var jQuery:any;

var Firebase   = require('firebase/lib/firebase-web.js');

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
    }
}
