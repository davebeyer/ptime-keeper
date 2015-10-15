/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}    from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'footer'
})

@View({
    directives: [RouterLink],

    template: `
	<nav class="navbar navbar-default navbar-fixed-bottom">
	  <div class="container">
	    <div class="navbar-header">
              <ul class="nav nav-tabs" style="width:100%">
	        <li role="presentation" class="active"> <a href="#" [router-link]="['/Plan']"> Plan    </a>    </li>
	        <li role="presentation">                <a href="#" [router-link]="['/SignIn']">Work   </a>    </li>
          	<li role="presentation">                <a href="#" (click)="gotoHistory($event)">  History </a> </li>
              </ul>
	    </div>
	  </div>
	</nav>
        `
})

export class Footer {
    router      : Router;

    constructor(router : Router) {
	this.router = router;
        console.log("footer.ts: in constructor")
    }

    gotoHistory($event) {
	// NOTE: here we use the router *name* not the actual route URL!
	this.router.navigate(['./SignIn']);    // SignIn

	// Can't figure out how to enable default bootstrap handling to do this
	var $li = jQuery($event.target).closest("li");
	$li.closest("ul").find("li").removeClass("active");
	$li.addClass("active");

	return true;
    }
}

