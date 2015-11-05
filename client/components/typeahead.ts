/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, EventEmitter, ElementRef} from 'angular2/angular2';

declare var jQuery:any;

// 
// jquery Bootstrap3-Typeahead wrapper for Angular2
//
// https://github.com/bassjobsen/Bootstrap-3-Typeahead
// 

@Component({
    selector: 'typeahead',
    properties: ['options', 'newoption', 'placeholder'],
    events:     ['select']
})

@View({
    template: `
        <input type="text" data-provide="typeahead"  placeholder="{{placeholder}}">
	`
})

export class Typeahead {
    placeholder : string;
    options     : Array<any>;
    newoption   : any;
    select      : EventEmitter;
    elemRef     : any;
    
    constructor(elemRef : ElementRef) {
        this.elemRef = elemRef;
        this.select  = new EventEmitter();
    }

    // Lifecycle call after view has been fully initialized 
    // (so jQuery("#" + _this.compid) will be found).
    afterViewInit() {
        var _this = this;

        var $obj   = jQuery(this.elemRef.nativeElement);
        var $input = $obj.find("input");
        
        var newItem;
        if (!_this.newoption) {
	    _this.newoption = false;
        }

        $input.typeahead({
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
                if (_this.newoption) {
                    if (item.id == _this.newoption.id) {
                        var val = this.$element.val();
                        if (!val.trim() || val == _this.newoption.name) {
                            // return id of null to indicate that user wants to add a new
                            // item but hasn't entered anything for it yet
                            return {id : null, name : item.name};
                        } else {
                            return {id : _this.newoption.id, name : val};
                        }
                    } 
                }

                return item;
            }
        });

        // Fix for bug in IOS as reported:
        // http://stackoverflow.com/questions/12190783/why-doesnt-bootstrap-button-dropdown-work-on-ios
        jQuery('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { 
            e.stopPropagation(); 
        });
    }
}
