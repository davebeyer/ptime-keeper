/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgClass} from 'angular2/angular2';
import {Router, RouterLink}       from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'footer'
})

@View({
    directives: [RouterLink, NgClass],

    template: `
        <nav class="navbar navbar-default navbar-fixed-bottom">
          <div class="container">
            <div class="navbar-header">
              <ul class="nav nav-tabs" style="width:100%">
                <li role="presentation" [class.active]="currentTab=='plan'">   
                  <a href="#" [router-link]="['/Plan']">   Plan   </a>    
                </li>
                <li role="presentation" [class.active]="currentTab=='work'">   
                  <a href="#" [router-link]="['/Work']">   Work   </a>    
                </li>
                <li role="presentation" [class.active]="currentTab=='history'">
                  <a href="#" [router-link]="['/History']">History</a> 
                </li>
              </ul>
            </div>
          </div>
        </nav>
        `
})

export class Footer {
    router          : Router;
    currentTab      : string;

    constructor(router : Router) {
        console.log("footer.ts: in constructor")
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

