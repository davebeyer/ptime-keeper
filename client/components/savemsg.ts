/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, ElementRef} from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'save-msg'
})

@View({
    template: `
          <h4  id="save-msg" class="img-rounded">{{saveMsg}}</h4>
	`,

    styles : [`
        #save-msg {
	    display:none;
            background-color: #50b050;
            color: white;
            padding: 5px 20px;
	}
    `]
})

export class SaveMsg {
    saveMsg;

    constructor() {
	console.log("savemsg constructor");
	this.saveMsg = "Saved";
    }

    flashMsg(msg?) {
	if (msg) {
	    this.saveMsg = msg;
	} else {
	    this.saveMsg = "Saved";
	}

	// TODO: Animate using angular2 methods?
	var $msg = jQuery("#save-msg");

	$msg.show();
	setTimeout(function() {
	    $msg.fadeOut(2000);
	}.bind(this), 500);
    }
}
