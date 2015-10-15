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
	    <div class="navbar-header">
              <ul class="nav nav-pills">
                <li role="presentation" class="navbar-text">Study Tracker</li>
                <li role="presentation" class="dropdown pull-right">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> 
                    Dave <span class="caret"></span>
                  </a>
                  <ul class="dropdown-menu">
                    <li>Dave Beyer</li>
                    <li role="seperator" class="divider"></li>
                    <li><a href="#">Account info</li>
                    <li><a href="#">Sign out</li>
                  </ul>
                </li>
              </ul>
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

