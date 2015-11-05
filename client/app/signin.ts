/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';

import {UserService} from '../services/users';

@Component({
    selector: 'signin'
})

@View({
    template: `
        <div class="text-center" style="width:100%">

          <div [hidden]="userServ.user.isLoggedIn">
            <table style="margin:40px auto">
              <tr>
                <td width="40%"> <img src="/img/tomato-md.png"/> </td>
                <td> <h2>  Welcome to <br/> Study Tracker!</h2> </td>
              </tr>
              <tr>
                <td colspan="2">
                  <h4 style="margin-top:40px">  
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

          <div [hidden]="!userServ.user.isLoggedIn" class="text-center">
            <table style="margin:35px auto">
              <tr>
                <td width="40%"> <img src="/img/tomato-md.png"/> </td>
                <td> <h2> Welcome<br/>{{userServ.user.firstName}}! </h2></td>
              </tr>
              <tr>
                <td colspan="2">
                  <h4 style="margin-top:40px">Click on a tab below to proceed!</h4>
                </td>
              </tr>
            </table>
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
