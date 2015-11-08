/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from 'angular2/angular2';
import {CanReuse, ComponentInstruction}   from 'angular2/router';

import {SettingsService}                  from '../services/settings';

import {isInteger}                        from '../public/js/validators';

@Component({
    selector: 'preferences-block'
})

@View({
    directives: [FORM_DIRECTIVES],
    template: `
        <h1>Preferences</h1>

        <form [ng-form-model]="prefsForm" #f="form" (ng-submit)="onSubmit(f.value)">

          <div class="form-group">

            <label>Work time (mins)</label>
            <input type="text" class="form-control" ng-control="work_mins">

          </div>

          <p>Form value {{formValue()}}</p>

          <button type="submit" class="btn btn-default" [disabled]="!f.valid">Save</button>
        </form>
        `
})


export class Preferences implements CanReuse {
    settings        : SettingsService;
    prefsForm       : ControlGroup;

    constructor(settings : SettingsService, fb : FormBuilder) {
        this.settings  = settings;
        this.prefsForm = fb.group({
	    'work_mins' : ['0', Validators.compose([Validators.required, isInteger])] 
	});

        console.log("preferences.ts: in constructor")
    }

    formValue() : string {
        return JSON.stringify(this.prefsForm.value, null, 2);
    }

    onInit() {
        var _this = this;

        this.settings.getSetting('work_mins').then(function(value) {
	    // updateValue method inherited from AbstactControl
	    // (Typesript compiler doesn't recognize it as a property)
            _this.prefsForm.controls['work_mins']['updateValue'](value.toString());

	    // Don't change dirty, this is initial state
            // _this.prefsForm.controls['work_mins']['markAsDirty']();
        });

        // this.settings.getSetting('shortBreak_mins').then(function(value) {
        // _this.prefsForm.controls.shortBreak_mins.value = value.toString();
        // });
    }


    onSubmit(value) {
        console.log("Saving values ", value);
        return;

        var newSettings = {
            work_mins: this.prefsForm.controls['work_mins'].value
        };

        // TODO: Check that it changed
        this.settings.setUserSettings(newSettings).then(function() {
            console.log("Successfully updated settings");
        });
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
        return true;
    }
}
