/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgFor, EventEmitter} from 'angular2/angular2';

@Component({
    selector:   'dropdown',
    properties: ['options', 'id', 'name'],
    events:     ['changeevent']     // NOTE that event names must be all lower case
})

@View({
    template: `
        <select class="form-control"  (change)="handleSelect($event)" id="{{id}}">
          <option value="-1">Select {{name}}</option>
          <option *ng-for="#opt of options" value="{{opt}}">{{opt}}</option>
        </select>
        `,
    directives: [NgFor]
})


export class Dropdown {
    // Properties
    options : Array<string>;  // list of strings for the <options> list
    id      : string;         // id for the <select> element
    name    : string;         // name of this dropdown

    // Locals
    current : string;         // current value

    // change event emitter
    changeEvent : EventEmitter;

    constructor() {
        this.changeEvent = new EventEmitter();
        this.current = "-1";
    }

    onInit() {
        // onInit() is a angular2 lifecycle method called 
        // automatically after angular2 has completed initialization

        console.log("Dropdown options", this.options);
    }

    handleSelect($event) {
        this.current = $event.target.value;
        console.log("Dropdown selected", this.current);
    }

    currentValue() {
        if (this.current === "-1") {
            return "";
        } else {
            return this.current;
        }
    }
}
