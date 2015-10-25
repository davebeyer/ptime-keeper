/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

import {Typeahead} from './typeahead';

declare var jQuery:any;

@Component({
    selector: 'plan-block'
})

@View({
    directives: [Typeahead],

    template: `
      <typeahead compid="category-select" placeholder="Enter a class" [options]="classOptions" [newoption]="newOption" (select)="selectClass($event, item)">
      </typeahead>

      <div class="collapse" id="category-add">
        Select a color for new class <b id="category-add-name"></b>
      </div>
        `
})

export class Plan implements CanReuse {
    classOptions : Array<any>;
    newOption    : any;

    constructor() {
        console.log("plan.ts: in constructor")
    }

    onInit() {
        this.classOptions = [{ id: 1, color: 'blue',    name: 'Science' }, 
                             { id: 2, color: 'red',     name: 'Math' }, 
                             { id: 3, color: '#AA22BB', name: 'English' }, 
                             { id: 4, color: '#222',    name: 'Art' }];

        this.newOption    = { id: -1, name: '(Add class)' }
    }

    selectClass(item) {
        console.log("plan.ts: Select class", item);

        if (item.id === -1) {
            jQuery("#category-add-name").text(item.name);
            jQuery("#category-add").show();
        }
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
        return true;
    }
}

