/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';

import {UserService}     from '../services/user';

@Component({
    selector: 'signin'
})

@View({
    template: `
      <div class="container">
        <div class="text-center" style="width:100%">

          <div [hidden]="userServ.isLoggedIn">
            <table style="margin:40px auto">
              <tr>
                <td width="40%"> <img src="/img/tomato-md.png"/> </td>
                <td> <h3>  Welcome to the <br/> Pomodoro Time Keeper!</h3> </td>
              </tr>
              <tr>
                <td colspan="2">
                  <h4 style="margin-top:40px" [hidden]="!initialized">
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
                </td>
              </tr>
            </table>
          </div>

          <div [hidden]="!userServ.isLoggedIn" class="text-center">
            <table style="margin:35px auto">
              <tr>
                <td width="40%"> <img src="/img/tomato-md.png"/> </td>
                <td> <h2> Welcome<br/>{{userServ.firstName}}! </h2></td>
              </tr>
              <tr>
                <td colspan="2">
                  <h4 style="margin-top:40px">
                    Click on a tab below to get started!<br/>
                    (Hint, start with "Plan" <i class="fa fa-smile-o"></i>)
                  </h4>
                </td>
              </tr>
            </table>
          </div>

          <div>
            <h4>Interested in a primer in the  <br/> Pomodoro Technique?  Try 
              <a href="http://lifehacker.com/productivity-101-a-primer-to-the-pomodoro-technique-1598992730" target="_blank">here</a>!
            </h4>
          </div>

        </div>
      </div>
      `
})

export class SignIn {
    userServ    : UserService;
    initialized : boolean;

    constructor(userServ : UserService) {
	var _this = this;
        console.log("signin.ts: in constructor")

        this.userServ       = userServ;
        this.initialized    = false;

        // Unclear how to determine when Firebase has automatically authenticated
        // (or not) pre-signedin user, so just wait a couple secs
        setTimeout(function() {_this.initialized = true;}.bind(this), 1500);
    }

    login(provider) {
        this.userServ.login(provider);
    }

    logout() {
        this.userServ.logout();
    }

}
