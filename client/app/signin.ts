/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';
import {RouterLink}               from 'angular2/router';

import {UserService} from './users';

declare var jQuery:any;

@Component({
    selector: 'signin'
})

@View({
    directives: [RouterLink],

    template: `
        <div class="signin-form">
          <div [hidden]="userServ.user.isLoggedIn">
            <h3 class="form-signin-heading">Please sign in using:</h3>
            <button class="btn btn-lg btn-primary btn-block" (click)="login('google')">  Google  </button>
            <button class="btn btn-lg btn-primary btn-block" (click)="login('facebook')">Facebook</button>
          </div>

          <div [hidden]="!userServ.user.isLoggedIn">
            Hello {{userServ.user.firstName}} <img src="{{userServ.user.profileImageURL}}"/> 
            <a class="btn" (click)="logout()">
              Sign out
            </a>
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
