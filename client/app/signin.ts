/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';

import {UserService} from './users';

@Component({
    selector: 'signin'
})

@View({
    template: `
        <div class="signin-form">
          <div [hidden]="userServ.user.isLoggedIn" class="text-center">
            <h3 class="form-signin-heading">Welcome to Study Tracker!</h3>

            <h4 style="margin-top:30px"> 
              Please sign in using
                <a class="btn-sm btn-social btn-google" (click)="login('google')" role="button">
                <span class="fa fa-google"></span> Google
              </a>
            </h4>
            <!--
	      <a class="btn-sm btn-social btn-facebook"  (click)="login('facebook')">
	        <span class="fa fa-facebook"></span> Facebook
	      </a>
	    -->     
          </div>

          <div [hidden]="!userServ.user.isLoggedIn" class="text-center">
            <h2>Welcome {{userServ.user.firstName}}!</h2>
	    <img src="{{userServ.user.profileImageURL}}"/> 
	    <h5>Click on a tab below to proceed!</h5>
          </div>
        </div>
      `
})

export class SignIn {
    userServ : UserService;

    constructor(userServ : UserService) {
        console.log("signin.ts: in constructor")

        this.userServ = userServ;
    }

    login(provider) {
        this.userServ.login(provider);
    }

    logout() {
        this.userServ.logout();
    }

}
