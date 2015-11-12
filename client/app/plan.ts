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

    // ".wrapper           {margin-left: 20px;}",
    //    "#new-plan-wrapper  {margin: 30px 10px 0 5px;}"

    styles: [
        ".activity-entry       {border-left: 8px solid transparent; margin: 2px 0; padding: 2px 0;}",
        ".tight                {padding: 0 5px;}",
        ".form-indent          {margin-left: 20px; width:calc(100% - 20px)}",
        ".colored-left-border{border-left: 8px solid white;}",
        ".new-section          {margin-top: 30px;}"
    ],

    template: `
      <div class="container">
        <div [hidden]="(viewMode == 'confirmOverlay') || !currentActivities.length">
          <div class="row">
            <h2 class="col-xs-9 page-title"> Current plan </h2>
            <button (click)="startNewPlan($event)" class="col-xs-3 btn btn-default"> 
              New plan
            </button>
          </div>
          <div class="row activity-entry" 
              *ng-for="#act of currentActivities" 
              [style.border-left-color]="categoryColor(act.category)">
            <div class="col-xs-4">{{categoryName(act.category)}}</div>
            <div class="col-xs-5">{{act.description}}</div>
            <div class="col-xs-3">
              <img *ng-for="#i of range(act.estimated_poms)" src="/img/tomato-tn.png"/>
            </div>
          </div>

          <h2 class="new-section">
          </h2>

          <div class="row form-indent">
            <div class="col-xs-3 tight"><label>Category</label></div>
            <div class="col-xs-6 tight"><label>Description</label></div>
            <div class="col-xs-2 tight"><label><img src="/img/tomato-tn.png"/>&#39;s </label></div>
            <div class="col-xs-1 tight"><label>&nbsp; </label></div>
          </div>

          <div class="colored-left-border" [style.border-color]="selectedCategory.color">
            <form [ng-form-model]="newActForm" #fwork="form" (ng-submit)="addActivity(fwork.value)" 
                  class="wrapper form-horizontal form-indent">

              <div class="form-group">
                <div class="col-xs-3 tight">
                  <select class="form-control" ng-control="cat">
                    <option *ng-for="#c of categories" value="{{c.id}}">{{c.name}}</option>
                    <option value="{{NewCategoryOpt}}"> (New category) </option>
                  </select>
                </div>

                <div class="col-xs-6 tight">
                  <input placeholder="(optional)"type="text" class="form-control" ng-control="descr">
                </div>

                <div class="col-xs-2 tight">
                  <select class="form-control" ng-control="poms">
                    <option *ng-for="#i of range(8)" value="{{i}}"> &nbsp;{{i}}&nbsp; </option>
                  </select>
                </div>

                <div class="col-xs-1 tight">
                  <button type="submit" class="btn btn-primary" [disabled]="!fwork.valid"> + </button>
                </div>
              </div>

            </form>
          </div>

        </div>

        <h2 class="new-section">
        </h2>

        <h2 class="page-title" [hidden]="(viewMode == 'confirmOverlay') || currentActivities.length">New plan</h2>

        <div class="row" [hidden]="viewMode == 'confirmOverlay'" style="display:none">
          <div [hidden]="categories.length">
            <button  (click)="createNewCategory($event)" class="col-xs-12  btn btn-primary">
              Create your first work category
            </button>
          </div>

          <div [hidden]="!categories.length">
            <button (click)="createNewCategory($event)" class="col-xs-5 col-xs-offset-1  btn btn-primary">
              New category
            </button>
          </div>
        </div>

        <div  [hidden]="viewMode != 'newCat'" style="margin-left:30px">

          <div class="row form-indent">
            <h4 class="col-xs-11 tight"> Create a new work category </h4>
            <div class="col-xs-1 tight" style="padding-top:10px">
              <a href="#"><i  (click)="cancelNewCategory($event)" class="fa fa-remove"></i></a>
            </div>
          </div>

          <div class="row form-indent">
            <div class="col-xs-5 tight"><label>Color</label></div>
            <div class="col-xs-6 tight"><label>Category name</label></div>
            <div class="col-xs-1 tight"></div>
          </div>

          <div class="colored-left-border" [style.border-color]="selectedColor">
            <form [ng-form-model]="newCatForm" #fcat="form" (ng-submit)="addCategory(fcat.value)" 
                  class="form-horizontal wrapper form-indent">

              <div class="form-group">
                <div class="col-xs-5 tight">
                  <select class="form-control" ng-control="color">
                    <option  *ng-for="#opt of categoryColors" value="{{opt}}"> {{opt}} </option>
                  </select>
                </div>

                <div class="col-xs-6 tight" [class.has-error]="!catname.valid">
                  <input type="text" class="form-control" ng-control="name" #catname="form">
                </div>

                <div class="col-xs-1 tight">
                  <button type="submit" class="btn btn-primary" [disabled]="!fcat.valid">+</button>
                </div>
              </div>

            </form>
          </div>

          <div class="row">
            <div class="col-xs-12">
              <div *ng-if="catname.dirty && catname.control.hasError('validchars')" class="bg-warning">Name must consist of at least some letters or numbers.</div>
              <div *ng-if="catname.control.hasError('unique')" class="bg-warning">This category name already exists.</div>
            </div>
          </div>

        </div>

        <div [hidden]="viewMode != 'confirmOverlay'">
          <h2>{{confirmTitle}}</h2>
          <h4 style="margin: 15px 0 30px 0">{{confirmMessage}}</h4>
          <button (click)="confirmYes($event)" class="btn btn-primary">Confirm</button>
          <button (click)="confirmNo($event)" class="btn btn-default">Cancel</button>
        </div>

      </div>
        `
})

export class Plan implements CanReuse {
    NewCategoryOpt   = "__new__";
    NullCategory     = {name : '', color : 'transparent'};

    categories       : Array<any>;
    categoryDict     : any;

    selectedCategory : any;
    selectedColor    : string;

    categoryColors   : Array<string>;

    viewMode         : string;

    userServ         : UserService;
    fBase            : FirebaseService;
    saveMsg          : SaveMsg;

    newCatForm       : ControlGroup;
    newActForm       : ControlGroup;

    currentPlan      : any;
    currentActivities : Array<any>

    confirmTitle     : string;
    confirmMessage   : string;

    fb               : FormBuilder;

    constructor(userServ : UserService, fb : FormBuilder, saveMsg : SaveMsg, fBase : FirebaseService) {
        console.log("plan.ts: in constructor")
	var _this = this;

        this.userServ = userServ;
        this.fBase    = fBase;
        this.saveMsg  = saveMsg;
        this.fb       = fb;

        this.categoryColors = ['Black', 'Blue', 'Brown', 'Cyan', 'Gold', 'Grey', 'Green', 'Lime', 'Maroon', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow'];

        this.currentPlan       = null;
        this.currentActivities = [];

        this.confirmTitle      = '';
        this.confirmMessage    = '';

        this.newCatForm = this.fb.group({
            'name'  : ['', this.uniqueCategory.bind(this)],
            'color' : ['', Validators.required]
        });

        this.newCatForm.controls['color'].valueChanges.observer({
            next : function(value) { 
                console.log("New value for color", value); 
                _this.selectedColor = value;
            }
        });

        this.newActForm = this.fb.group({
            'cat'    : [''],
            'descr'  : [''],
            'poms'   : ['2']
        });

        this.newActForm.controls['cat'].valueChanges.observer({
            next : function(value) { 
                console.log("New value for categoriy", value); 
                if (value in _this.categoryDict) {
                    _this.selectedCategory = _this.categoryDict[value];
		    _this.viewMode = 'dfltMode';  // in case the 'newCat' panel is open
                } else { 
                    _this.selectedCategory = _this.NullCategory;
                    if (value == _this.NewCategoryOpt) {
                        _this.createNewCategory();
                    }
                }
            }
        });
    }

    onInit() {
        this.viewMode         = 'initializing';
        this.categories       = [];
        this.categoryDict     = {};

        this.selectedCategory = this.NullCategory;
        this.selectedColor    = "transparent";

        this.getCategories();
        this.getCurrentPlan();
    }

    //
    // Work category handling
    //

    range(num) {
        var res = [];
        for (var i=1; i<=num; i++) {
            res.push(i);
        }
        return res;
    }

    categoryName(catId) {
        var catInfo = this.categoryDict[catId];
        return catInfo ? catInfo.name : catId;
    }

    categoryColor(catId) {
        var catInfo = this.categoryDict[catId];
        return catInfo ? catInfo.color : 'black';
    }

    createNewCategory($event? : any) {
	if ($event) {
            $event.preventDefault();
	}

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

        this.viewMode = 'newCat';
    }

    cancelNewCategory($event) {
        $event.preventDefault();
        this.viewMode = 'dfltMode';

        if (this.categories.length) { 
            this.newActForm.controls['cat']['updateValue'](this.categories[0].id);
        }
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

        this.userServ.updateUserData(newCat, 'categories').then(function() {
            console.log("Successfully added work category");

            // Add category to our list
            _this.trackCategory(id, catEntry);
            _this.categories.sort(_this.sortCategories.bind(_this));

            // Clear out the category name
            _this.newCatForm.controls['name']['updateValue']('');

	    // Set the category in the new activity form to this new category
            _this.newActForm.controls['cat']['updateValue'](id);

            // Flash 'saved' and return to Planning view
            _this.saveMsg.flashMsg();
            _this.viewMode = 'dfltMode';
            _this.selectedCategory = catEntry;
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
            // Special case, form invalid but don't show an error
            return {nonempty: true};
        }
        
        var value = this.nameToCategoryId(ctrl.value);

        if (!value) {
            return {validchars: true};
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

        this.categories   = [];
        this.categoryDict = {};

        this.userServ.getUserData('categories').then(function(value) {
            if (value) {
                var keys = Object.keys(value);
                for (var i = 0; i < keys.length; i++) {
                    _this.trackCategory(keys[i], value[keys[i]]);
                }
                _this.categories.sort(_this.sortCategories.bind(_this));

                _this.newActForm.controls['poms']['updateValue']('2');
                if (_this.categories.length) { 
                    _this.newActForm.controls['cat']['updateValue'](_this.categories[0].id);
                }
            }
            _this.viewMode = 'dfltMode';
        });
    }

    trackCategory(id, info) {
        info['id'] = id;
        this.categories.push(info);
        this.categoryDict[id] = info;
    }

    //
    // Handling for this plan
    //

    getCurrentPlan() {
        var _this = this;

	return; // TESTING

        this.userServ.getUserData('plans', {limitToLast : true}).then(function(value) {

            if (value) {
                var planId = Object.keys(value)[0];  // should only be one key

                _this.currentPlan = value[planId];
                _this.currentPlan['created'] = planId     // convenience

                // NOTE: Alternatively could iterate to get activities listed in 
                //       currentPlan.activities.

                _this.userServ.getUserActivitiesForPlan(planId).then(function(value) {
                    if (value) {
                        _this.currentActivities = [];

                        var activity;
                        var ids = Object.keys(value);

                        for (var i=0; i < ids.length; i++) {
                            _this.trackActivity(value[ids[i]]);
                        }
                        _this.currentActivities.sort(_this.sortActivities.bind(_this));
                        console.log("getCurrentActivities: current activities: ", _this.currentActivities);
                    }
                });
            }
        });
    }

    trackActivity(info) {
        this.currentActivities.push(info);        
    }

    sortCategories(a, b) {
        if (a.name < b.name) {
            return -1;
        } else {
            return 1;
        }
    }

    sortActivities(a, b) {
        var name1 = this.categoryName(a.category);
        var name2 = this.categoryName(b.category);
        if (name1 < name2) {
            return -1;
        } else if (name2 < name1) {
            return 1;
        } else if (a.created < b.created) {
            return -1;
        } else {
            return 1;
        }
    }

    cancelNewActivity($event) {
        $event.preventDefault();
        this.viewMode = 'dfltMode';
    }

    addActivity(formValue) {
        // descr & poms
        var _this = this;

        console.log("Adding activity ", formValue);
        this.viewMode = 'dfltMode';

        var created = this.fBase.dateToKey(new Date());

        var newActivity = {
            category       : this.selectedCategory.id,
            created        : created,
            description    : formValue.descr,
            estimated_poms : formValue.poms
        }

        if (this.currentPlan == null) {
            this.currentPlan = {created : created,
                                name    : created};  // later, allow possibility of naming plans
        } 

        if (!this.currentPlan['activities']) {
            this.currentPlan['activities'] = {};
        }
        this.currentPlan['activities'][created] = "1"

        var planId = this.currentPlan['created'];

        newActivity['plans'] = {};
        newActivity['plans'][planId] = "1";

        var entry = {};
        entry[created] = newActivity;

        //
        // For simultaneous, multi-location updates
        // See: https://www.firebase.com/blog/2015-09-24-atomic-writes-and-more.html
        //
        var userUpdate = {};
        userUpdate["activities/" + created] = newActivity;
        userUpdate["plans/" + planId]       = this.currentPlan;

        // this.userServ.updateUserData(entry, 'activities').then(function() {
        this.userServ.updateUserData(userUpdate).then(function() {
            _this.saveMsg.flashMsg();
            _this.trackActivity(newActivity);
            _this.currentActivities.sort(_this.sortActivities.bind(_this));
            console.log("Successfully added activity ", entry);
        });
    }

    //
    // Confirmation
    //

    startNewPlan() {
        // this.confirmId      = 'start-new-plan';
        this.confirmTitle   = "Start a new plan";
        this.confirmMessage = "Please confirm that you'd like to start with a completely new (initially empty) plan.";
        this.viewMode = 'confirmOverlay';
    }

    confirmYes() {
        // TODO: currently, only one type of confirmation
        this.currentPlan       = null;
        this.currentActivities = [];
        this.viewMode = 'dfltMode';
    }

    confirmNo() {
        // TODO: currently, only one type of confirmation
        this.viewMode = 'dfltMode';
    }

    //
    // Misc
    //

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
        return true;
    }
}
