/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}   from 'angular2/angular2';
import {RouterLink}        from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'header'
})

@View({
    directives: [RouterLink],

    template: `
	<nav class="navbar navbar-default navbar-fixed-top">
	  <div class="container">
	    <div class="row" style="padding-top: 8px">
                <h4 class="col-xs-6">Study Tracker</h4>

                <div class="col-xs-4 col-xs-offest-2 dropdown pull-right">
                  <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                    Dave <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    <li>Dave Beyer</li>
                    <li role="seperator" class="divider"></li>
                    <li><a href="#">Account info</li>
                    <li><a href="#">Sign out</li>
                  </ul>
                </div>
            </div>
	  </div>
	</nav>
        `
})

export class Header {
    constructor() {
        console.log("header.ts: in constructor")
    }
}

