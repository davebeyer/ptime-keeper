/// <reference path="../../typings/tsd.d.ts" />

require("bootstrap");

import {Component, View, bootstrap, provide}                     from 'angular2/angular2';

import {ROUTER_PROVIDERS, RouteConfig, Router}                   from 'angular2/router';
import {Route, Location, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {RouterOutlet}                                            from 'angular2/router';

import {Header}          from './header';
import {Footer}          from './footer';

import {SignIn}          from './signin';
import {Preferences}     from './preferences';

import {Plan}            from './plan';
import {Work}            from './work';
import {Review}         from './review';

import {UserService}     from '../services/user';
import {FirebaseService} from '../services/firebase';
import {SettingsService} from '../services/settings';

import {SaveMsg}         from '../components/savemsg';

declare var jQuery:any;

@Component({
    selector: 'app'
})

@View({
    directives: [RouterOutlet, Header, Footer],

    template: `
        <header></header>

        <router-outlet></router-outlet>

        <footer></footer>
        `
})

@RouteConfig([
    { path: '/plan',    as: 'Plan',        component: Plan },
    { path: '/work',    as: 'Work',        component: Work },
    { path: '/review',  as: 'Review',      component: Review },
    { path: '/signin',  as: 'SignIn',      component: SignIn },
    { path: '/prefs',   as: 'Preferences', component: Preferences }
])

class PomodoroTimeKeeper {
    userServ : UserService;
    router   : Router;
    fBase    : FirebaseService;

    constructor(router : Router, userServ : UserService, fBase : FirebaseService) {
        this.router   = router;
        this.userServ = userServ;
        this.fBase    = fBase;

        console.log("main.ts: in PomodoroTimeKeeper constructor")
    }

    onInit() {
        this.fBase.initDB().then(function(msg) {
            console.log(msg);
        });

        // Always start on the signin page, which will give a welcome 
        // message if already signed in

        // NOTE: here we use the router *name* not the actual route URL!
        this.router.navigate(['./SignIn']);    // SignIn
    }

}


// similar to jQuery(document).ready(), but doesn't work in old IE browsers
document.addEventListener('DOMContentLoaded', function(){ 
    bootstrap(PomodoroTimeKeeper,

              // List of universally injectable providers
              [
                  UserService,
                  FirebaseService,
		  SettingsService,
		  SaveMsg,
                  ROUTER_PROVIDERS,
                  provide(LocationStrategy, {useClass: HashLocationStrategy})
              ]

             );

}, false);

