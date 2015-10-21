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
                <li role="presentation" [class.active]="currentTab=='Plan'">   <a href="#" (click)="goto($event, 'Plan')">   Plan   </a>    </li>
                <li role="presentation" [class.active]="currentTab=='Work'">   <a href="#" (click)="goto($event, 'Work')">   Work   </a>    </li>
                <li role="presentation" [class.active]="currentTab=='History'"><a href="#" (click)="goto($event, 'History')">History</a> </li>
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
        this.currentTab = 'Plan';
    }

    goto($event, tabStr) {
        console.log("Navigating to", tabStr);

        // Using router.navigate() rather than router-link in template to 
        // ensure that tab styling also changes in footer (via this.currentTab)

        this.router.navigate(['./' + tabStr]); 
        this.currentTab = tabStr;

        return true;
    }
}

