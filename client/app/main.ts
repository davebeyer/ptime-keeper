/// <reference path="../../typings/tsd.d.ts" />

require("bootstrap");

import {Component, View, bootstrap, provide}                     from 'angular2/angular2';

import {ROUTER_PROVIDERS, RouteConfig, Router}                   from 'angular2/router';
import {Route, Location, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {RouterLink, RouterOutlet}                                from 'angular2/router';

import {Header}    from './header';
import {Footer}    from './footer';

import {UserService} from '../services/users';
import {SignIn}    from './signin';

import {Plan}      from './plan';
import {Work}      from './work';
import {History}   from './history';

declare var jQuery:any;

var Firebase   = require('firebase/lib/firebase-web.js');

@Component({
    selector: 'app'
})

@View({
    directives: [RouterLink, RouterOutlet, Header, Footer],

    template: `
        <header></header>

        <div class="container">
          <router-outlet></router-outlet>
        </div>

        <footer></footer>
        `
})

@RouteConfig([
    { path: '/plan',    as: 'Plan',    component: Plan },
    { path: '/work',    as: 'Work',    component: Work },
    { path: '/history', as: 'History', component: History },
    { path: '/signin',  as: 'SignIn',  component: SignIn }
])

class StudyTracker {
    userServ : UserService;
    fbRef    : Firebase;
    router   : Router;

    constructor(router : Router, userServ : UserService) {
        this.router   = router;
        this.userServ = userServ;

        console.log("main.ts: in StudyTracker constructor")
    }

    onInit() {
        this.fbRef  = new Firebase('https://study-tracker.firebaseio.com');
        this.userServ.setDB(this.fbRef);

        // NOTE: here we use the router *name* not the actual route URL!
        this.router.navigate(['./SignIn']);    // SignIn
    }

}


// similar to jQuery(document).ready(), but doesn't work in old IE browsers
document.addEventListener('DOMContentLoaded', function(){ 
    bootstrap(StudyTracker, 

              // List of universally injectable providers
              [
                  UserService,
                  ROUTER_PROVIDERS,
                  provide(LocationStrategy, {useClass: HashLocationStrategy})
              ]

             );

}, false);

