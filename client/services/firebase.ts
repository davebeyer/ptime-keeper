/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

var Firebase = require('firebase/lib/firebase-web.js');

export class FirebaseService {
    fbRef : Firebase;

    constructor() {
	console.log("firebase.ts: in FirebaseService constructor")
        this.fbRef  = new Firebase('https://study-tracker.firebaseio.com');
    }
}