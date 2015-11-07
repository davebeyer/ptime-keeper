/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

import {SettingsService}                from '../services/settings';

@Component({
    selector: 'preferences-block'
})

@View({
    template: `
        <h1>Preferences</h1>
	<p> Work mins: {{work_mins}} </p>
	<p> Short Break mins: {{shortBreak_mins}} </p>
        <button (click)="submit()">Save</button>
        `
})

export class Preferences implements CanReuse {
    settings        : SettingsService;

    work_mins       : string;
    shortBreak_mins : string;

    constructor(settings : SettingsService) {
	this.settings = settings;
	this.work_mins = '';
	this.shortBreak_mins = '';

        console.log("preferences.ts: in constructor")
    }

    onInit() {
	var _this = this;
	this.settings.getSetting('work_mins').then(function(value) {
	    _this.work_mins = value.toString();
	});
	this.settings.getSetting('shortBreak_mins').then(function(value) {
	    _this.shortBreak_mins = value.toString();
	});
    }

    submit() {
	this.settings.setUserSettings({work_mins: 30}).then(function() {
	    console.log("Successfully updated settings");
	});
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
	return true;
    }
}
