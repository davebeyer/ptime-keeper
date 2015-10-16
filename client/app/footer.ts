/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

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
	        <li role="presentation" [ng-class]="planClassMap">   <a href="#" [router-link]="['/Plan']"> Plan    </a>    </li>
	        <li role="presentation" [ng-class]="workClassMap">   <a href="#" [router-link]="['/SignIn']">Work   </a>    </li>
          	<li role="presentation" [ng-class]="historyClassMap"><a href="#" (click)="goto($event, 'history')">  History </a> </li>
              </ul>
	    </div>
	  </div>
	</nav>
        `
})

export class Footer {
    router          : Router;

    historyClassMap : any;
    workClassMap    : any;
    planClassMap    : any;

    constructor(router : Router) {
        console.log("footer.ts: in constructor")
	this.router = router;
	this.activateTab('plan');
    }

    deactivateTabs() {
	this.planClassMap    = {active : false};
	this.workClassMap    = {active : false};
	this.historyClassMap = {active : false};
    }

    activateTab(tabStr) {
	this.deactivateTabs();

	switch(tabStr) {
	case 'plan':
	    this.planClassMap.active = true;
	    break;
	case 'work':
	    this.workClassMap.active = true;
	    break;
	case 'history':
	    this.historyClassMap.active = true;
	    break;
	}
    }

    goto($event, tabStr) {
	console.log("Navigating to", tabStr);

	// NOTE: here we use the router *name* not the actual route URL!
	this.router.navigate(['./SignIn']);    // SignIn

	this.activateTab('signin');

	return true;
    }
}

