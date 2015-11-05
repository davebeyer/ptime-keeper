/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

import {Typeahead} from '../components/typeahead';

declare var jQuery:any;

const NEW_CLASS_ID = -1;

@Component({
    selector: 'plan-block'
})

@View({
    directives: [Typeahead],

    template: `
      <typeahead placeholder="Enter a class" [options]="classOptions" [newoption]="newOption" (select)="selectClass($event, item)">
      </typeahead>

      <div  [hidden]="!addNewClass">
        Select a color for new class <b>{{newClass}}</b>
      </div>
        `
})

export class Plan implements CanReuse {
    classOptions : Array<any>;
    newOption    : any;
    newClass     : string;
    addNewClass  : boolean;

    constructor() {
        console.log("plan.ts: in constructor")
    }

    onInit() {
        this.newClass     = '';
        this.addNewClass  = false;

        this.newOption    = {id : NEW_CLASS_ID, name : "Add class"};

        this.classOptions = [{ id: 1, color: 'blue',    name: 'Science' }, 
                             { id: 2, color: 'red',     name: 'Math' }, 
                             { id: 3, color: '#AA22BB', name: 'English' }, 
                             { id: 4, color: '#222',    name: 'Art' }];
    }

    selectClass(item) {
        console.log("plan.ts: Select class", item);

        switch(item.id) {
        case NEW_CLASS_ID:
            this.newClass = item.name;
            this.addNewClass  = true;
            jQuery("#category-add").show();
            break;
        case null:
            this.newClass = '';
            this.addNewClass  = true;
            jQuery("#category-add").show();
            break;
        default:
            this.addNewClass  = false;
            break;
        }
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
        return true;
    }
}
