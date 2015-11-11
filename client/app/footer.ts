/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgClass} from 'angular2/angular2';
import {Router, RouterLink}       from 'angular2/router';

import {SaveMsg}           from '../components/savemsg';
import {UserService}       from '../services/user';

@Component({
    selector: 'footer'
})

@View({
    directives: [RouterLink, NgClass, SaveMsg],

    template: `
      <div class="container">
        <nav class="navbar navbar-default navbar-fixed-bottom">
          <div class="container">
            <div class="navbar-header"  [hidden]="!userServ.isLoggedIn">
              <ul class="nav nav-tabs" style="width:100%">
                <li role="presentation" [class.active]="currentTab=='plan'">   
                  <a href="#" [router-link]="['/Plan']"><i class="fa fa-tasks"></i> Plan </a>    
                </li>
                <li role="presentation" [class.active]="currentTab=='work'">   
                  <a href="#" [router-link]="['/Work']"><i class="fa fa-gears"></i> Work </a>    
                </li>
                <li role="presentation" [class.active]="currentTab=='review'">
                  <a href="#" [router-link]="['/Review']"><i class="fa fa-book"></i> Review</a> 
                </li>
              </ul>
            </div>
          </div>

          <save-msg></save-msg>
        </nav>
      </div>
	`,

    styles: [
	`save-msg {
	    position: absolute;
	    right: 20px;
	    bottom: 5px;
	}`
    ]

})

export class Footer {
    userServ        : UserService;
    router          : Router;
    currentTab      : string;

    constructor(userServ : UserService, router : Router) {
        console.log("footer.ts: in constructor")
	this.userServ   = userServ;
        this.router     = router;
        this.currentTab = '';
    }

    onInit() {
	var _this = this;
        this.router.subscribe(function(url) {
	    // strange(?) that router emits an url and not 
	    // a more parseable instruction
	    _this.currentTab = url;
            console.log("router navigated to", url);
        });
    }
}

