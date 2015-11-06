# User Authentication

## Google OAth

See [instructions on Firebase site](https://www.firebase.com/docs/web/guide/login/google.html).

Need to configure two main places:
* [Google Application](https://console.developers.google.com/home/dashboard?project=ptime-keeper), and
  * OAuth 2.0 Client ID, follow instructions according to above Firebase instructions for google
  * Copy resulting OAuth client ID and secret to Firebase config
      * Client id: 808032727617-he6cp4ov6jv7006ntk61fhiag7f3ehce.apps.googleusercontent.com
      * Secret: gN...92  (See Firebase config for ptime-keeper for full secret)
* [Firebase Login & Auth page](https://ptime-keeper.firebaseio.com/?page=Auth).

NOTE: Even though [this
page](https://www.firebase.com/docs/web/guide/login/google.html)
claims that the authentication data returned by the Firebase
authentication call should have a field `authData.google.email`, it doesn't
seem to be present.  So, using the google unique user id as the user's
key in the database (at least for now).
  
