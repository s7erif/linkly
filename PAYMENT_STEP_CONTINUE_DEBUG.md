# Payment Step Continue Debug

## Execution path

`Continue` is a submit button inside the checkout `<form>`. The form invokes `next(event)`, which calls `preventDefault()`, clears the previous error, validates payment fields when `step === 3`, and then advances with `setStep`.

## Root cause

The handler used `Math.min(3, value + 1)`. On the Payment step (`step === 3`), successful validation could only produce step 3 again, so the UI appeared stuck. No network request was expected at this point because submission only occurs on the Review step.

## Validation conditions

Payment progression requires payment method, sender name, sender phone, reference number, and a non-empty MediaAsset ID in `details.proof`. Uploading a file alone is insufficient.

## Fix

- Changed the step cap from 3 to 4.
- Added explicit per-field failure collection.
- Logged failed validation to the console with step, missing fields, proof presence, and upload state.
- Rendered the exact missing-field message inside the Payment step.

## Result

Successful upload plus complete payment data advances to Review. Failed validation remains on Payment and explains the missing requirement. No payment/order API call is made until Review submission.
