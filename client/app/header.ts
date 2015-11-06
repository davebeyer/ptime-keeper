/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';
import {Router, RouterLink}       from 'angular2/router';

import {UserService}       from '../services/user';

@Component({
    selector: 'header'
})

@View({
    directives: [RouterLink],

    template: `
	<nav class="navbar navbar-default navbar-fixed-top">
	  <div class="container">
	    <div class="row" style="padding-top: 8px">
                <h4 class="col-xs-8">Pomodoro Time Keeper</h4>

                <div class="col-xs-4 dropdown pull-right" [hidden]="!userServ.isLoggedIn">
                  <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                    <img src="{{userServ.profileImageURL}}" style="height:25px"/> 
                    &nbsp; {{userServ.firstName}}
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    <li class="dropdown-header">
                      {{userServ.fullName}}
                    </li>
                    <li role="seperator" class="divider"></li>
                    <li><a href="#" [router-link]="['/Preferences']"><i class="fa fa-wrench"></i> Preferences</a></li>
                    <li><a href="#" (click)="logout()"><i class="fa fa-sign-out"></i> Sign out</a></li>
                  </ul>
                </div>
            </div>
	  </div>
	</nav>
        `
})

export class Header {
    userServ : UserService;
    router   : Router;

    constructor(userServ : UserService, router : Router) {
        console.log("header.ts: in constructor")
	this.userServ = userServ;
	this.router   = router;
    }

    logout() {
	this.userServ.logout();
        this.router.navigate(['./SignIn']);    // SignIn
    }
}

