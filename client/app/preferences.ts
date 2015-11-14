/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgIf, FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from 'angular2/angular2';

import {SettingsService}                  from '../services/settings';
import {SaveMsg}                          from '../components/savemsg';

import {isInteger}                        from '../public/js/validators';

@Component({
    selector: 'preferences-block'
})

@View({
    directives: [FORM_DIRECTIVES, NgIf],

    styles: ["form {margin-left: 20px;}"],

    template: `
      <div class="container">
        <h2 class="page-title">Preferences</h2>

        <form [ng-form-model]="prefsForm" #f="form" (ng-submit)="onSubmit(f.value)" [hidden]="!initialized"
              class="form-horizontal">

          <div class="form-group" [class.has-error]="!work.valid">
            <div class="col-xs-3">
              <input type="text" class="form-control" ng-control="work_mins" #work="form">
            </div>
            <label class="col-xs-9">Work time (mins)</label>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <!-- Demonstrate how to give specific errors -->
              <div *ng-if="work.control.hasError('required')" class="bg-warning">Required field.</div>
              <div *ng-if="work.control.hasError('integer')"  class="bg-warning">Must be an integer number of minutes.</div>
            </div>
          </div>

          <div class="form-group" [class.has-error]="!shortbreak.valid">
            <div class="col-xs-3">
              <input type="text" class="form-control" ng-control="shortBreak_mins" #shortbreak="form">
            </div>
            <label  class="col-xs-9">Short break time (mins)</label>
          </div>
          <div class="row">
            <div [hidden]="shortbreak.valid"  class="col-xs-12 bg-warning">Must be an integer number of minutes</div>
          </div>

<!--
          <div class="form-group" [class.has-error]="!longbreak.valid">
            <div class="col-xs-3">
              <input type="text" class="form-control" ng-control="longBreak_mins" #longbreak="form">
            </div>
            <label class="col-xs-9">Long break time (mins)</label>
          </div>
          <div class="row">
            <div [hidden]="longbreak.valid"  class="col-xs-12 bg-warning">Must be an integer number of minutes</div>
          </div>
 -->

          <button type="submit" class="btn btn-primary" [disabled]="!f.valid || !f.dirty">Save</button>
        </form>
      </div>
      `
})


export class Preferences  {
    settings        : SettingsService;
    prefsForm       : ControlGroup;
    initialized     : boolean;
    saveMsg         : SaveMsg;
    settingNames    : Array<string>;

    constructor(settings : SettingsService, fb : FormBuilder, saveMsg : SaveMsg) {
        this.settings     = settings;
        this.settingNames = ['work_mins', 'longBreak_mins', 'shortBreak_mins'];

        this.prefsForm = fb.group({
            'work_mins'       : ['', Validators.compose([Validators.required, isInteger])],
            'shortBreak_mins' : ['', Validators.compose([Validators.required, isInteger])],
            'longBreak_mins'  : ['', Validators.compose([Validators.required, isInteger])] 
        });

        this.initialized = false;
        this.saveMsg     = saveMsg;

        console.log("preferences.ts: in constructor")
    }

    formValue() : string {
        return JSON.stringify(this.prefsForm.value, null, 2);
    }

    onInit() {
        var _this = this;

        this.settings.getAllSettings().then(function(value) {
            var name;

            for (var i = 0; i < _this.settingNames.length; i++) {
                // updateValue method inherited from AbstactControl
                // (Typesript compiler doesn't recognize it as a property)
                name = _this.settingNames[i];
                _this.prefsForm.controls[name]['updateValue'](value[name].toString());

                // Don't change dirty, this is initial state
                // _this.prefsForm.controls[name]['markAsDirty']();
            }


            _this.initialized = true;
        });

        // this.settings.getSetting('shortBreak_mins').then(function(value) {
        // _this.prefsForm.controls.shortBreak_mins.value = value.toString();
        // });
    }


    onSubmit(value) {
        var _this = this;

        // Note that this Save button is only visible if the input 
        // is "dirty" (presumably modified) and "valid"

        console.log("Saving values ", value);

        var name;
        var newSettings = {};

        for (var i = 0; i < _this.settingNames.length; i++) {
            name = _this.settingNames[i];
            newSettings[name] = this.prefsForm.controls[name].value;
        }

        this.settings.setUserSettings(newSettings).then(function() {
            console.log("Successfully updated settings");
            _this.saveMsg.flashMsg();
        });
    }
}
