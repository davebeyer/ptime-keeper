/// <reference path="../../typings/angular2/angular2.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

require("firebase");
require("bootstrap");

import {Component, View, bootstrap} from 'angular2/angular2';

var Firebase   = require('firebase/lib/firebase-web.js');
var UserBlock  = require('./users').UserBlock;

@Component({
    selector: 'my-app'
})

@View({
    template: `
        <user-block (initevent)="registerUserBlock($event)"> </user-block>

        <div class="container">
          <input type="text" data-provide="typeahead" id="category-select" placeholder="Enter a class">

          <div class="collapse" id="category-add">
  	    Select a color for new class <b id="category-add-name"></b>
          </div>
        </div>

        `,
    directives: [UserBlock]
})

class StudyTracker {
    userBlock   : UserBlock; 
    fbRef       : Firebase;

    constructor() {
        this.fbRef = new Firebase('https://study-tracker.firebaseio.com');
        console.log("main.ts: in StudyTracker constructor")

        var data = [{ id: 1, color: 'blue',    name: 'Science' }, 
                    { id: 2, color: 'red',     name: 'Math' }, 
                    { id: 3, color: '#AA22BB', name: 'English' }, 
                    { id: 4, color: '#222',    name: 'Art' }];

        $("#category-select").typeahead({
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
		    $("#category-add-name").text(item.name);
		    $("#category-add").show();
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
	$('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { 
	    e.stopPropagation(); 
	});
    }

    registerUserBlock(userComp) {
	this.userBlock = userComp;
	userComp.registerParent(this, this.fbRef);
    }
}


$(document).ready(function() {
    bootstrap(StudyTracker);
});

