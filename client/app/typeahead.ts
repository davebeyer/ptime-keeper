/// <reference path="../../node_modules/angular2/angular2.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />

import {Component, View, EventEmitter}    from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'typeahead',
    properties: ['options', 'newoption', 'compid', 'placeholder'],
    events:     ['select']
})

@View({
    template: `
        <input type="text" data-provide="typeahead" id="{{compid}}" placeholder="{{placeholder}}">
    `
})

export class Typeahead {
    compid      : string;
    placeholder : string;
    options     : Array<any>;
    newoption   : any;
    select      : EventEmitter;
    
    constructor() {
        this.select = new EventEmitter();
    }

    // Lifecycle call after view has been fully initialized 
    // (so jQuery("#" + _this.compid) will be found).
    afterViewInit() {
        var _this = this;

        jQuery("#" + _this.compid).typeahead({
            source          : _this.options,
            minLength       : 0,
            showHintOnFocus : true,
            addItem         : _this.newoption,
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
                _this.select.next(item);
            },
            updater         : function(item) {
                return item;

                // if (item.id === -1) {
                //     return {id : -2, name : _this.$element.val() };
                // } else {
                //     return item;
                // }
            }
        });

        // Fix for bug in IOS as reported:
        // http://stackoverflow.com/questions/12190783/why-doesnt-bootstrap-button-dropdown-work-on-ios
        jQuery('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { 
            e.stopPropagation(); 
        });
    }
}
