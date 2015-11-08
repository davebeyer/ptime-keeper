/// <reference path="../../../typings/tsd.d.ts" />

//
// Angular2 validators for model-based forms
//

import {Control} from 'angular2/angular2';

export function isInteger (ctrl : Control) {
    if (! ctrl.value.match(/^[\d]*$/)){
	return {integer: true};
    }
    return null;  // Valid
}
