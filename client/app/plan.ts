/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators, NgIf} from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

import {Typeahead}       from '../components/typeahead';
import {SaveMsg}         from '../components/savemsg';

import {UserService}     from '../services/user';
import {FirebaseService} from '../services/firebase';

@Component({
    selector: 'plan-block'
})

@View({
    directives: [Typeahead, FORM_DIRECTIVES, NgIf],

    styles: ["form {margin-left: 20px;}"],

    template: `
        <h1 class="page-title">Plan for today</h1>

        <div  [hidden]="newCategoryMode">
          <typeahead placeholder="Select a work category" [options]="categories"  (select)="selectCategory($event, item)">
          </typeahead>
          <button (click)="getNewCategory($event)" class="btn btn-default">Add new category</button>
        </div>

        <div  [hidden]="!newCategoryMode">

          <form [ng-form-model]="newCatForm" #f="form" (ng-submit)="addCategory(f.value)" class="form-horizontal">

            <div class="form-group" [class.has-error]="!catname.valid">
            <div class="col-xs-5">
                <input type="text" class="form-control" ng-control="name" #catname="form">
              </div>
              <label  class="col-xs-7">Category name</label>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <div *ng-if="catname.control.hasError('required')" class="bg-warning">Required field.</div>
                <div *ng-if="catname.control.hasError('empty')"    class="bg-warning">Must consist of at least some letters or numbers.</div>
                <div *ng-if="catname.control.hasError('unique')"   class="bg-warning">This category already exists.</div>
              </div>
            </div>

            <div class="form-group" [class.has-error]="!catcolor.valid">
              <div class="col-xs-5">
                <input type="text" class="form-control" ng-control="color" #catcolor="form">
              </div>
              <label  class="col-xs-7">Category color</label>
            </div>
            <div class="row">
              <div [hidden]="catcolor.valid"  class="col-xs-12 bg-warning">Must be a valid color string.</div>
            </div>

            <button type="submit" class="btn btn-default" [disabled]="!f.valid">Add work category</button>
          </form>
        </div>
        `

})

export class Plan implements CanReuse {
    categories       : Array<any>;
    newCategoryMode  : boolean;

    userServ         : UserService;
    fBase            : FirebaseService;
    saveMsg          : SaveMsg;

    newCatForm       : ControlGroup;

    constructor(userServ : UserService, fb : FormBuilder, saveMsg : SaveMsg, fBase : FirebaseService) {
        console.log("plan.ts: in constructor")

        this.userServ = userServ;
        this.fBase    = fBase;
        this.saveMsg  = saveMsg;

        this.newCatForm = fb.group({
            'name'  : ['', Validators.compose([Validators.required, this.uniqueCategory.bind(this)])],
            'color' : ['', Validators.required]
        });
    }

    onInit() {
        this.newCategoryMode  = false;
        this.categories       = [];
        this.getCategories();
    }

    //
    // Work category handling
    //

    getNewCategory($event) {
        $event.preventDefault();
        this.newCategoryMode = true;
    }

    addCategory(formValue) {
        console.log("Adding category", formValue);
    }

    nameToCategoryId(name : string) {
        var id = this.fBase.stringToKey(name);
        if (!id) {
            return id;
        } else {
            return id.toLowerCase();
        }
    }

    uniqueCategory (ctrl : Control) : any {
        var value = this.nameToCategoryId(ctrl.value);

        if (!value) {
            return {empty: true};
        }

        for (var i = 0; i < this.categories.length; i++) {
            if (value == this.categories[i].id) {
                return {unique: true};
            }
        }

        return null;  // Valid
    }


    getCategories() {
        var _this = this;

        this.categories = [];

        this.userServ.getUserData('categories').then(function(value) {
            if (value) {
                var category;
                var keys = Object.keys(value);
                for (var i = 0; i < keys.length; i++) {
                    category = value[keys[i]];
                    _this.categories.push({id      : keys[i],
                                           color   : category.color,
                                           created : category.created,
                                           name    : category.name});
                }
                _this.categories.sort();
            }
        });
    }

    //
    // Handle planning work activities for this session
    //

    selectCategory(item) {
        console.log("plan.ts: Select category", item);
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
        return true;
    }
}
