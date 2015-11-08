/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators, NgIf, NgFor} from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

import {Typeahead}       from '../components/typeahead';
import {SaveMsg}         from '../components/savemsg';

import {UserService}     from '../services/user';
import {FirebaseService} from '../services/firebase';

import {randomInt}       from '../public/js/utils';

@Component({
    selector: 'plan-block'
})

@View({
    directives: [Typeahead, FORM_DIRECTIVES, NgIf, NgFor],

    styles: [".form-wrapper {margin-left: 20px;}"],

    template: `
        <h1 class="page-title">My plan for today</h1>

        <div  [hidden]="newCategoryMode" class="row">
          <typeahead class="col-xs-8" placeholder="Select a work category" [options]="categories"  (select)="selectCategory($event, item)">
          </typeahead>
          <button (click)="createNewCategory($event)" class="col-xs-3 btn btn-default">Create new</button>
        </div>

        <div  [hidden]="!newCategoryMode" class="form-wrapper">
          <h3> Create a new work category </h3>
          <form [ng-form-model]="newCatForm" #f="form" (ng-submit)="addCategory(f.value)" class="form-horizontal">

            <div class="form-group" [class.has-error]="!catname.valid">
              <div class="col-xs-5">
                <input type="text" class="form-control" ng-control="name" #catname="form">
              </div>
              <label  class="col-xs-7">Name</label>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <div *ng-if="catname.dirty && catname.control.hasError('empty')"    class="bg-warning">Must consist of at least some letters or numbers.</div>
                <div *ng-if="catname.control.hasError('unique')"   class="bg-warning">This category already exists.</div>
              </div>
            </div>

            <div class="form-group" [class.has-error]="!catcolor.valid">
              <div class="col-xs-5">
                <select class="form-control" ng-control="color" #catcolor="form">
                  <option *ng-for="#opt of categoryColors" value="{{opt}}">{{opt}}</option>
                </select>
              </div>
              <label  class="col-xs-7">Color</label>
            </div>
            <div class="row">
              <div [hidden]="catcolor.valid"  class="col-xs-12 bg-warning">Must be a valid color string.</div>
            </div>

            <button type="submit" class="btn btn-default" [disabled]="!f.valid">Save</button>
            <button (click)="cancelNewCategory($event)" class="btn btn-default">Cancel</button>
          </form>
        </div>
        `

})

export class Plan implements CanReuse {
    categories       : Array<any>;
    categoryColors   : Array<string>;

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

        this.categoryColors = ['Black', 'Blue', 'Brown', 'Cyan', 'Gold', 'Grey', 'Green', 'Lime', 'Maroon', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow'];

        this.newCatForm = fb.group({
            'name'  : ['', this.uniqueCategory.bind(this)],
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

    createNewCategory($event) {
        $event.preventDefault();

        //
        // Try to initialize color to unused color
        //

        var currentColors = [];
        for (var i = 0; i < this.categories.length; i++) {
            currentColors.push(this.categories[i].color.toLowerCase());
        }

        var color = this.newCatForm.controls['color'].value;

        if (!color || currentColors.indexOf(color.toLowerCase()) > -1) {
            var colorNum = randomInt(0, this.categoryColors.length);
            var maxTries = this.categoryColors.length;

            while (maxTries) {
                color = this.categoryColors[colorNum].toLowerCase();

                if (currentColors.indexOf(color) == -1) {
                    break;  // found an unused color
                }
            
                maxTries --;
                colorNum ++;
                if (colorNum >= this.categoryColors.length) {
                    colorNum = 0;
                }
            }

            this.newCatForm.controls['color']['updateValue'](this.categoryColors[colorNum]);
        }

        this.newCategoryMode = true;
    }
    cancelNewCategory($event) {
        $event.preventDefault();
        this.newCategoryMode = false;
    }

    addCategory(formValue) {
        var _this = this;

        var catEntry =  {
            color   : formValue.color.toLowerCase(),
            created : new Date(),
            name    : formValue.name
        }

        var newCat = {};
        var id     = this.nameToCategoryId(formValue.name);
        newCat[id] = catEntry;

        console.log("Adding category", newCat);

        this.userServ.updateUserData('categories', newCat).then(function() {
            console.log("Successfully added work category");

            // Add category to our list
            catEntry['id'] = id;
            _this.categories.push(catEntry);

            // Clear out the category name
            _this.newCatForm.controls['name']['updateValue']('');

            // Flash 'saved' and return to Planning view
            _this.saveMsg.flashMsg();
            _this.newCategoryMode = false;
        });
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
        if (!ctrl.value) {
            // Special case, allow this without showing an error
            return null;
        }
        
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
