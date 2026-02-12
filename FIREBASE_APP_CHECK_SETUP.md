# Firebase App Check Setup Guide

Your security update requires some manual configuration in the Firebase Console. Follow these steps to secure your app.

## Step 1: Enable App Check in Firebase
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **rayzer-portfolio**.
3.  In the left sidebar, under **Build**, click **App Check**.
4.  Click **Get Started**.

## Step 2: Register for reCAPTCHA Enterprise
1.  In the **App Check** page, go to the **Apps** tab.
2.  Find your web app and click **Register**.
3.  Select **reCAPTCHA Enterprise**.
4.  You will need a **Site Key**.
    *   If you don't have one, go to the [reCAPTCHA Enterprise Console](https://console.cloud.google.com/security/recaptcha).
    *   Create a Key.
    *   Set the domain to `rayzer-portfolio.web.app` and `localhost` (for testing).
    *   Copy the generated **Site Key**.

## Step 3: Configure Firebase
1.  Back in the Firebase Console (App Check window), paste your **Site Key**.
2.  Click **Save**.

## Step 4: Update Your Code
1.  Open `js/firebase-config.js` in your project.
2.  Find the line:
    ```javascript
    provider: new ReCaptchaEnterpriseProvider('YOUR_RECAPTCHA_SITE_KEY'),
    ```
3.  Replace `'YOUR_RECAPTCHA_SITE_KEY'` with the actual key you just copied.

## Step 5: Deploy
Once you've updated the code:
1.  Run `firebase deploy` in your terminal.
2.  Your app is now protected! 🛡️
