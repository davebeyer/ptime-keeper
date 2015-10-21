/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View}   from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'plan-block'
})

@View({
    template: `
          <input type="text" data-provide="typeahead" id="category-select" placeholder="Enter a class">

          <div class="collapse" id="category-add">
  	    Select a color for new class <b id="category-add-name"></b>
          </div>
        `
})

export class Plan {
    constructor() {
        console.log("plan.ts: in constructor")

        var data = [{ id: 1, color: 'blue',    name: 'Science' }, 
                    { id: 2, color: 'red',     name: 'Math' }, 
                    { id: 3, color: '#AA22BB', name: 'English' }, 
                    { id: 4, color: '#222',    name: 'Art' }];

        jQuery("#category-select").typeahead({
            source          : data,
            minLength       : 0,
            showHintOnFocus : true,
            addItem         : { id: -1, name: '(Add class)' },
	    formatter   : function(item) {
		var html = this.highlighter(this.displayText(item));
		if (item.color) {
		    html = '<div class="dropdown-color-box" style="background-color:' + item.color + '"> </div>' + html;
		} else {
		    html = '<div class="dropdown-color-box"> </div>' + html;
		}
		return html
	    },
            afterSelect     : function(item) {
                console.log("Selected", item);
		if (item.id === -2) {
		    jQuery("#category-add-name").text(item.name);
		    jQuery("#category-add").show();
		}
            },
            updater         : function(item) {
                if (item.id === -1) {
                    return {id : -2, name : this.$element.val() };
                } else {
                    return item;
                }
            }
        });

	// Fix for bug in IOS as reported:
	// http://stackoverflow.com/questions/12190783/why-doesnt-bootstrap-button-dropdown-work-on-ios
	jQuery('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { 
	    e.stopPropagation(); 
	});
    }
}

