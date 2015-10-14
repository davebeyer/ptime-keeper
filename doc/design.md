# Study Tracker App

## Overview

Based on Pompodoro Time Management
* 25 mins work, 5 mins break, dflt
* 15 min (long break) every 4 pompodoros, dflt

With time tracking to review estimates vs actuals
* Though break-timing and estimates based on Pompodoros, tracking done to
* minute accuracy, with default history displays in terms of pompodoros


Saves data in the cloud, but works offline too

Configuration:
  Setup activity categories (English, Math, Science...)
  Assign color coding by category

  If rename an activity category, asks whether this is "new" or just a renaming
  of an existing activity (in which case, tracking history will continue)

Daily homework session:
  New Session
  Plan activities and estimates in terms of Pompodoros
  Each activity gets:
    Activity category
    Estimated number of Pompodoros
    Optional activity details
  E.g.,
    English: Write outline, 2 Pomps
    French: <no details>, 1 Pomp
    Math: Study for test, 2 Pomps

Work:
  Activities are listed, select which one to work on
  Start Activity, which starts session
  At end of Pompodoro, alarm sounds, start break, alarm ends break
  Can "Pause" timer (pauses also tracked)
  End Session when done

Session Display Modes:
  Working:
    Timer showing countdown time to next break (or negative time if past break)
    Current Activity shown with:
      Activity category (colored) and description
      Estimated Pompodoros for this session
      Actual Pompodoros so far
    Buttons for:
      Take Break (button gets big if timer is negative)
      Finish Activity
  Break (when Take Break pressed):
    Timer showing countdown time to next work sprint (dflt 5 mins or 15 mins if long break)
    Current activity shown as above (click on it to switch)
    Buttons for:
      Resume Work (gets big if timer is negative)
      Finish Activity
  Finished (like taking a break, but marks activity as finished)
    Timer showing countdown time to next work sprint
    Nice job, you were X pompodoros under/over today's budget!
    Current activity expands (as if clicked) to pick next activity (if pick
    a "finished" activity, then reopen it as not yet finished)

  For all, gears icon to edit today's session or categories (or history?)

History:
  Estimates vs Actuals, Work time vs Pauses
  Pie chart, scatter/bar chart
  Daily, Weekly, Monthly, Annually
  Drill down to daily level to show detailed work

Database:
  - Users
    = user_id
    = email_address
    = password
    = (or FB/Google/.. credentials?)
    = reviewer_email_address
    = created_dt

  - Categories
    = category_id
    = user_id
    = category_name
    = category_color
    = created_dt

  - Sessions
    = session_id
    = user_id
    = created_dt
    = working_mins
    = break_mins
    = pause_mins

  - Activities
    = activity_id
    = session_id
    = category_id
    = details
    = estimate_pomps (supports fractions, to 1/4ths)
    = actual_pomps (support fractions)
    = created_dt
    = started_dt
    = finished_dt

  - Events
    = user_id
    = event_dt
    = event_type (Activity_start, Activity_finish, Break)
    = activity_id
