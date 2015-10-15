/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

require("firebase");
require("bootstrap");

import {Component, View, bootstrap, provide}   from 'angular2/angular2';

// TODO: May be redudnancy in following?
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {ROUTER_DIRECTIVES, RouteConfig, RouterLink, RouterOutlet, Router, Location, Route} from 'angular2/router';

import {UserBlock} from './users';
import {SignIn}    from './signin';
import {Plan}      from './plan';

declare var jQuery:any;

var Firebase   = require('firebase/lib/firebase-web.js');

@Component({
    selector: 'app'
})

@View({
    directives: [RouterLink, RouterOutlet, UserBlock],

    template: `
        <user-block (initevent)="registerUserBlock($event)"> </user-block>

        <div class="container">
          <router-outlet></router-outlet>
        </div>
        `
})

@RouteConfig([
    { path: '/plan',    as: 'Plan',   component: Plan },
    { path: '/signin',  as: 'SignIn', component: SignIn }
])

class StudyTracker {
    userBlock   : UserBlock;
    fbRef       : Firebase;
    router      : Router;

    constructor(router : Router) {
        this.router = router;
        this.fbRef  = new Firebase('https://study-tracker.firebaseio.com');
        console.log("main.ts: in StudyTracker constructor")
    }

    registerUserBlock(userComp) {
        this.userBlock = userComp;
        userComp.registerParent(this, this.fbRef);

	// NOTE: here we use the router *name* not the actual route URL!
	this.router.navigate(['./Plan']);    // SignIn
    }
}

// similar to jQuery(document).ready(), but doesn't work in old IE browsers
document.addEventListener('DOMContentLoaded', function(){ 
    bootstrap(StudyTracker, 

              // List of universally injectable providers
              [
                  ROUTER_PROVIDERS, 
                  provide(LocationStrategy, {useClass: HashLocationStrategy})
              ]

             );

}, false);

