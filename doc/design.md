# Pomodoro Time Keeper

## Features

Based on Pomodoro Time Management

* 25 mins work, 5 mins break, default
* 15 min (long break) every 4 pomodoros, dflt

Includes time tracking to review past estimates vs actuals

* Although break-timing and estimates are based on Pomodoros, actual
  time tracking is kept to minute accuracy, with default history
  displays in terms of pomodoros.

Saves data in the cloud, but also works offline

## Configuration

* Setup activity categories (English, Math, Science...)
* Assign color coding by activity category
* When renaming an activity category, asks whether this is "new" or just a renaming
  of an existing activity (in which case, tracking history will continue)

## Plan:

* Plan activities and estimates in terms of Pomodoros
* Each activity gets:
  * Activity category
  * Estimated number of Pomodoros
  *  Optional activity details
  * E.g.,
      * English: Write outline, 2 Poms
      * French: <no details>, 1 Pom
      * Math: Study for test, 2 Poms

## Work:

* Activities are listed, select which one to work on
* Click "Start/Resume" Activity, which starts work period
* At end of Pomodoro, alarm sounds, start break, alarm ends break
* Can "Pause" timer (pauses also tracked)

## Display Modes

* Working:
  *  Timer showing countdown time to next break (or negative time if past break)
  *  Current Activity shown with:
      * Activity category (colored) and description
      * Estimated Pomodoros for this activity
      * Actual Pomodoros so far
  * Buttons for:
      * Take Break (button gets big if timer is negative)
      * Finish Activity
  * Break (when Take Break pressed):
      * Timer showing countdown time to next work sprint (dflt 5 mins or 15 mins if long break)
      * Current activity shown as above (click on it to switch)
      * Buttons for:
          * Resume Work (gets big if timer is negative)
          * Finish Activity
  * Finished (like taking a break, but marks activity as finished)
      * Timer showing countdown time to next work sprint
      * Nice job, you were X pomodoros under/over today's budget!
    * Current activity expands (as if clicked) to pick next activity (if pick
      a "finished" activity, then reopen it as not yet finished)

  * For all, gears icon to edit preferences or ... 

## History:
* Estimates vs Actuals, Work time vs Pauses
* Pie chart, scatter/bar chart
* Daily, Weekly, Monthly, Annually
* Drill down to daily level to show detailed work

## Database info

* Defaults
    * pomodoro_mins 
    * longBreak_mins
    * shortBreak_mins

* UserIdenties
   * google 
       * google_uid
           * userId
   * facebook
       * facebookuid
           * userId
   * local
       * userId
           * provider_uids (list)

* UserData
    * userId - auto assigned
        * created

        * categories
            * id - derived from name
                * created
                * name
                * color

        * plans
            * id  <created datetime>  [limitToLast() to get current]
                * created : <datetime>
                * name - default to formatted date & time
                * activities 
                      * activityIds - bidirectional links ("denormalized data")

        * activities
            * id  <created datetime>
                * created  : <datetime>
                * category : <categoryId>
                * description  : <string>
                * estimate_poms : <number>  (supports fractions, to 1/4ths)
                * plans
                    * planIds - bidirectional links ("denormalized data")
                                [equalTo(<planId>) to get activities for a given plan]
                * events
                    * id <created datetime>
                        * created : <datetime>
                        * eventType (Start, Resume, Progress, Break, Complete)

        * Preferences
            * work_mins
            * shortBreak_mins
            * longBreak_mins
