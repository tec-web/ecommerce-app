import { FormControl, ValidationErrors } from "@angular/forms";

export class FormsValidator {
    static notOnlyWhitespaces(control: FormControl): ValidationErrors {
        if ((control.value !== null) && (control.value.trim().length === 0)) {
            return { 'notOnlyWhitespaces': true };
        } else {
            return null;
        }
    }
}
