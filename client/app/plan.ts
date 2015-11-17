/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators, NgIf, NgFor} from 'angular2/angular2';

import {Router}                         from 'angular2/router';

import {Typeahead}         from '../components/typeahead';
import {SaveMsg}           from '../components/savemsg';

import {SettingsService}   from '../services/settings';
import {UserService}       from '../services/user';
import {FirebaseService}   from '../services/firebase';
import {ActivitiesService} from '../services/activities';

import {Sounds}            from '../components/sounds';

import {randomInt, range}  from '../public/js/utils';

declare var jQuery:any;


@Component({
    selector: 'plan-block'
})

@View({
    directives: [Typeahead, FORM_DIRECTIVES, NgIf, NgFor],

    styles: [
        ".activity-entry .row        {border-left: 8px solid transparent; margin: 3px 0 0 0; padding: 2px 0;}",
        ".activity-entry .info:hover {background: #eee; cursor:pointer;}",
        ".activity-entry .editing    {margin-bottom: 20px; margin-top: 0;}",

        ".tight                {padding: 0 5px;}",
        ".form-indent          {margin-left: 20px; width:calc(100% - 20px)}",
        ".colored-left-border  {border-left: 8px solid white;}",
        ".new-section          {margin-top: 30px;}",
        ".done-percentage      {font-size: 12px;}"
    ],

    template: `
      <div class="container">

        <div [hidden]="(viewMode == 'confirmOverlay')">

          <div class="row"  [hidden]="!actServ.hasActivities()">
            <h2 class="col-xs-9 page-title plan-title"  title="{{actServ.planDate}} Plan created at {{actServ.planTime}}"> 
              {{actServ.planDate}} Plan 
            </h2>
            <button (click)="startNewPlan($event)" class="col-xs-3 btn btn-default" 
                    title="Set this plan aside and start a new plan">
              New plan
            </button>
          </div>

          <div class="row"  [hidden]="actServ.hasActivities()">
            <h2 class="col-xs-12 page-title"> New plan </h2>
          </div>

          <div class="activity-entry" *ng-for="#act of actServ.activities">
              
            <div class="row info" [style.border-left-color]="actServ.categoryColor(act.category)" (click)="toggleEditing(act)">
              <div class="col-xs-4 tight"><b>{{actServ.categoryName(act.category)}}</b></div>
              <div class="col-xs-5 tight">{{act.description}}</div>
              <div class="col-xs-2 tight">
                <img *ng-for="#i of donePomRange(act)" src="/img/tomato-tn.png" class="pomodoro-completed"/>
                <img *ng-for="#i of todoPomRange(act)" src="/img/tomato-tn.png" class="pomodoro-todo"/>
              </div>
              <div class="col-xs-1 tight">
                <div [hidden]="!isActCompleted(act)">
                  <i class="fa fa-check"></i>
                </div>
              </div>
            </div>

            <div class="row editing" [style.border-left-color]="actServ.categoryColor(act.category)" [class.hidden]="!activityEditing[act['created']]">

              <div class="col-xs-9 tight" style="padding-top:2px">
                <button class="btn btn-default" [style.border-color]="actServ.categoryColor(act.category)"
                        (click)="startActivity(act)"
                         title="Start or restart work on this activity">

                  <i class="fa fa-play"></i> Start
                </button>
                <!-- use class since hidden property does not work on buttons -->
                <button class="btn btn-default" [style.border-color]="actServ.categoryColor(act.category)"
                        (click)="activityFinished(act)" [class.hidden]="isActCompleted(act)"  
                         title="This activity has been completed!">
                  <i class="fa fa-check"></i> Done
                </button>

                &nbsp;

                <span class="done-percentage" title="The relative amount of time worked on this activity as a percentage of that estimated.">
                  {{completedMsg(act)}}
                </span>
              </div>

              <div class="col-xs-3 tight" style="padding-top:2px">
                <button class="btn btn-default" href="#" [style.border-color]="actServ.categoryColor(act.category)"
                        (click)="delActivity(act)"
                         title="Remove this activity from this plan">
                  <i class="fa fa-remove"></i> Delete
                </button>
              </div>
            </div>

          </div>

          <hr [hidden]="!actServ.hasActivities()" style="margin-top:30px"/>

          <div [hidden]="!actServ.hasCategories()">
            <div class="row form-indent">
              <h4 class="col-xs-12 tight" [hidden]="!actServ.hasActivities()">Add an activity</h4>
              <h3 class="col-xs-12 tight" [hidden]="actServ.hasActivities()">Add an activity</h3>
            </div>

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
                      <option *ng-for="#c of actServ.categories" value="{{c.id}}">{{c.name}}</option>
                      <option value="{{NewCategoryOpt}}"> (New category) </option>
                    </select>
                  </div>

                  <div class="col-xs-6 tight">
                    <input placeholder="(optional)"type="text" class="form-control" ng-control="descr">
                  </div>

                  <div class="col-xs-2 tight">
                    <select class="form-control" ng-control="poms">
                      <option *ng-for="#i of range(8)" value="{{i+1}}"> &nbsp;{{i+1}}&nbsp; </option>
                    </select>
                  </div>

                  <div class="col-xs-1 tight">
                    <button type="submit" class="btn btn-success" [disabled]="!fwork.valid">
                      + 
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>

        </div>

        <div  [hidden]="viewMode != 'newCat' && actServ.hasCategories()" style="margin-left:30px">

          <div class="row form-indent">

            <h4 class="col-xs-11 tight" [hidden]="!actServ.hasCategories()">Add a new work category </h4>
            <div class="col-xs-1 tight" [hidden]="!actServ.hasCategories()" style="padding-top:10px">
              <a href="#">
                <i (click)="cancelNewCategory($event)" class="fa fa-remove"></i>
              </a>
            </div>

            <div class="col-xs-12 tight" [hidden]="actServ.hasCategories()"> 
              <h3 style="margin-bottom:5px">Create your first work category</h3>
              <p>(like "Math" or "Psych")</p>
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
                    <option  *ng-for="#opt of actServ.categoryColors" value="{{opt}}"> {{opt}} </option>
                  </select>
                </div>

                <div class="col-xs-6 tight" [class.has-error]="!catname.valid">
                  <input type="text" class="form-control" ng-control="name" #catname="form">
                </div>

                <div class="col-xs-1 tight">
                  <button type="submit" class="btn btn-success" [disabled]="!fcat.valid">
                    +
                  </button>
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
          <h5 style="margin: 15px 0 30px 0">{{confirmMessage}}</h5>
          <button (click)="confirmYes($event)" class="btn btn-success">Confirm</button>
          <button (click)="confirmNo($event)" class="btn btn-default">Cancel</button>
        </div>

      </div>
        `
})

export class Plan  {
    NewCategoryOpt   = "__new__";

    selectedCategory : any;
    selectedColor    : string;

    viewMode         : string;

    userServ         : UserService;
    fBase            : FirebaseService;
    actServ          : ActivitiesService;
    settings         : SettingsService;
    saveMsg          : SaveMsg;
    sounds           : Sounds;

    newCatForm       : ControlGroup;
    newActForm       : ControlGroup;

    confirmTitle     : string;
    confirmMessage   : string;

    activityEditing  : any;

    fb               : FormBuilder;
    router           : Router;

    constructor(userServ : UserService, 
                actServ  : ActivitiesService,
                fb       : FormBuilder, 
                saveMsg  : SaveMsg, 
                sounds   : Sounds, 
                fBase    : FirebaseService,
                settings : SettingsService,
                router   : Router) {
        console.log("plan.ts: in constructor")
        var _this = this;

        this.userServ = userServ;
        this.actServ  = actServ;
        this.fBase    = fBase;
        this.saveMsg  = saveMsg;
        this.sounds   = sounds;
        this.fb       = fb;
        this.router   = router;
        this.settings = settings;

        this.confirmTitle      = '';
        this.confirmMessage    = '';

        this.activityEditing   = {};

        this.newCatForm = this.fb.group({
            'name'  : ['', this.uniqueCategory.bind(this)],
            'color' : ['', Validators.required]
        });

        this.newCatForm.controls['color'].valueChanges.observer({
            next : function(value) { 
                // console.log("New value for color", value); 
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
                // console.log("New value for category", value); 
                _this.selectedCategory = _this.actServ.categoryInfo(value);
                if (_this.selectedCategory.name) {
                    // valid category, set mode in case the 'newCat' panel is open
                    _this.viewMode = 'dfltMode'; 
                } else { 
                    if (value == _this.NewCategoryOpt) {
                        _this.createNewCategory();
                    }
                }
            }
        });
    }

    /**
     * Component lifecycle method
     */
    onInit() {
        var _this = this;

        this.viewMode         = 'initializing';

        this.selectedCategory = this.actServ.categoryInfo(null);
        this.selectedColor    = "transparent";

        // TODO: Consider subscribing to (TBD) onChange event from ActivitiesService
        //       to update the following

        this.viewMode = 'dfltMode';

        this.resetCategoryForm(true);
        this.resetActivityForm();

        this.actServ.notifyInit(function() {
            _this.resetCategoryForm(true);
            _this.resetActivityForm();
        });
    }

    /**
     * Component lifecycle method called after vieew has been updated as needed.
     */
    afterViewChecked() {
        // Add tooltips for all titled elements (incl possible new ones)
        jQuery("[title]").each(function() {
            var $this = jQuery(this);
            if ($this.hasClass('plan-title')) {
                return true;  // handled below
            }
            
            if ($this.attr('data-original-title') !== undefined) {
                return true; // Already has a tooltip
            }

            // Add tooltip
            $this.tooltip({placement: 'top', delay : 500});
        })


        var $title = jQuery(".plan-title");

        var title    = this.actServ.planDate + " Plan created at " + this.actServ.planTime;
        var curTitle = $title.attr('data-original-title');

        if (curTitle  === undefined) {
            $title.tooltip({placement: 'top', delay : 500});
        } else if (curTitle != title) {
            $title.attr('data-original-title', title).tooltip('fixTitle');
        }
    }

    //
    // Work category handling
    //

    createNewCategory($event? : any) {
        if ($event) {
            $event.preventDefault();
        }
        this.resetCategoryForm(true);
        this.viewMode = 'newCat';
    }

    cancelNewCategory($event) {
        $event.preventDefault();
        this.viewMode = 'dfltMode';

        if (this.actServ.hasCategories()) { 
            this.resetActivityForm(this.actServ.categories[0].id, true);
        }
    }

    resetCategoryForm(chooseUnusedColor : boolean) {
        // Always clear name
        this.newCatForm.controls['name']['updateValue']('');

        if (!chooseUnusedColor) {
            // Clear color, and return
            this.newCatForm.controls['color']['updateValue']('');
            return;
        }

        //
        // Try to initialize color to unused color
        //

        // create a list of the colors currently being used 
        // by the list of available categories

        var currentColors = [];
        for (var i = 0; i < this.actServ.categories.length; i++) {
            currentColors.push(this.actServ.categories[i].color.toLowerCase());
        }

        var color = this.newCatForm.controls['color'].value;

        // If the color is already being used by >=1 category (or no color is set), 
        // then try to choose a good color

        if (!color || currentColors.indexOf(color.toLowerCase()) > -1) {
            var colorNum = randomInt(0, this.actServ.categoryColors.length);
            var maxTries = this.actServ.categoryColors.length;

            while (maxTries) {
                color = this.actServ.categoryColors[colorNum].toLowerCase();

                if (currentColors.indexOf(color) == -1) {
                    break;  // found an unused color
                }
            
                maxTries --;
                colorNum ++;
                if (colorNum >= this.actServ.categoryColors.length) {
                    colorNum = 0;
                }
            }

            this.newCatForm.controls['color']['updateValue'](this.actServ.categoryColors[colorNum]);
        }
    }

    resetActivityForm(catId? : string, catOnly? : boolean) {
        if (!catId) {
            if (this.actServ.hasCategories()) {
                catId = this.actServ.categories[0]['id']; 
            } else {
                catId = '';
            }
        }

        this.newActForm.controls['cat']['updateValue'](catId);

        if (!catOnly) {
            this.newActForm.controls['descr']['updateValue']('');
            this.newActForm.controls['poms']['updateValue']('2');
        }
    }

    addCategory(formValue) {
        var _this = this;

        var catEntry = {
            color  : formValue.color.toLowerCase(),
            name   : formValue.name
        }

        this.actServ.addCategory(catEntry).then(function(newCat) {
            console.log("Successfully added work category", newCat);

            var id = Object.keys(newCat)[0]; // only one key

            // Set the category in the new activity form to this new category
            _this.resetActivityForm(id, true);

            _this.viewMode = 'dfltMode';
            _this.selectedCategory = newCat[id];
        });
    }

    uniqueCategory (ctrl : Control) : any {
        if (!ctrl.value) {
            // Special case, form invalid but don't show an error
            return {nonempty: true};
        }

        var value = this.actServ.nameToCategoryId(ctrl.value);

        if (!value) {
            return {validchars: true};
        }

        for (var i = 0; i < this.actServ.categories.length; i++) {
            if (value == this.actServ.categories[i].id) {
                return {unique: true};
            }
        }

        return null;  // Valid
    }

    //
    // Handling for this plan
    //


    cancelNewActivity($event) {
        $event.preventDefault();
        this.viewMode = 'dfltMode';
    }

    addActivity(formValue) {
        var _this  = this;
        var values = {
            categoryId  : this.selectedCategory.id,
            description : formValue.descr,
            pomodoros   : formValue.poms
        };

        console.log("Adding activity ", formValue, values);

        this.viewMode = 'dfltMode';

        this.actServ.addActivity(values).then(function() {
            _this.resetActivityForm();
            console.log("Successfully added activity ", values);
        });
    }

    toggleEditing(activity) {
        var id = activity['created']; 
        if (this.activityEditing[id]) {
            this.activityEditing[id] = false;
        } else {
            this.activityEditing     = {};  // Close any/all others
            this.activityEditing[id] = true;
        }
    }

    startActivity(activity) {
        this.actServ.setWorkActivity(activity);
        this.router.navigate(['/Work', {state : 'start'}]); 
    }

    activityFinished(activity) {
        this.sounds.play("completed")
        this.actServ.addActivityEvent('complete', activity['created']);
    }

    delActivity(activity) {
        this.actServ.delActivity(activity);
        this.actServ.clearWorkActivity(activity);
    }

    isActCompleted(activity) {
        return this.actServ.isComplete(activity['created']);
    }

    donePomRange(activity) {
        return range(activity['onPomNum']);
    }

    todoPomRange(activity) {
        return range(activity['estNumPoms'] - activity['onPomNum']);
    }

    completedMsg(activity) {
        var num = parseFloat(activity['completedPerc']).toFixed(0);
        return num  + '%';
    }

    //
    // Confirmation
    //

    startNewPlan() {
        // this.confirmId      = 'start-new-plan';
        this.confirmTitle   = "Start a new plan";
        this.confirmMessage = "Please confirm that you'd like to start with a completely new (initially empty) plan.";
        this.viewMode       = 'confirmOverlay';
    }

    confirmYes() {
        // TODO: currently, only one type of confirmation
        this.actServ.startNewPlan();
        this.viewMode     = 'dfltMode';
    }

    confirmNo() {
        // TODO: currently, only one type of confirmation
        this.viewMode = 'dfltMode';
    }

    //
    // Misc
    //

    // Make utils.range() available to template
    range(num) {
        return range(num);
    }

}
