# Tickd Play Store launch checklist

These materials match the current task planner, local finance store, OpenAI integration and Firebase Messaging dependency. The policy includes Prateeek Pandey and prateekpandey2580@gmail.com. Verify the final release before submission.

## Privacy publication

1. Confirm the developer name and email in privacy-policy.html match your listing. Set the effective date to the actual publication date.
2. Host the HTML at a public HTTPS URL that works without login or geographic restrictions. Google requires an accessible policy page, not a PDF or editable document.
3. Replace `https://example.com/privacy` in `src/features/settings/screens/SettingsScreen.tsx` with that URL. Enter the same URL in Play Console.
4. Open the URL on a phone and test the app's Privacy Policy button.

The policy file is ready for hosting with your supplied contact details; it has not been published. [Google User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en) also requires disclosures inside the app when applicable; a policy page alone does not replace consent.

## Data safety preparation

Do not select “no data collected” for a build with functioning AI or auto-initialising Firebase Messaging. Off-device processing counts separately from local storage. The following is a mapping to verify against the shipped build, not a completed Console declaration.

| Data flow | Candidate Console data type | Purpose and review |
| --- | --- | --- |
| Pending task titles and priorities sent to OpenAI | Other user-generated content; also classify personal data intentionally included in text | App functionality: task insights. Requests run automatically on Smart Dashboard data changes. |
| Text entered for AI task parsing | Other user-generated content; assess other personal categories present | App functionality: task parsing. Triggered by the user's parse action. |
| Income, expense and split-owed totals sent to OpenAI | Financial info → Other financial info | App functionality: budget suggestions. Sent with dashboard insight requests, including while the tasks tab is selected. |
| Firebase installation identifiers and messaging registration data | Device or other IDs | Messaging functionality. Review Firebase configuration and SDK disclosures; disabling visible notifications does not necessarily stop identifier collection. |
| Tasks, transaction titles, split names and preferences kept only on device | Local-only data is outside off-device collection reporting | Reassess if backup, sync or a new SDK is introduced. Current app has no cloud account or task sync. |

AI requests use HTTPS. Verify the release's merged manifest, SDK network behaviour, provider account settings and all transmission paths before claiming that all collected data is encrypted in transit. Do not mark requests as ephemeral simply because Tickd does not keep responses on a server; providers can retain logs. Do not mark collection optional unless users can actually decline it for that data type in the shipped app.

Google permits certain service-provider transfers to be excluded from “sharing”, but only when its definition applies. Confirm the actual OpenAI/Firebase agreements and processing purposes before selecting an answer. Disclose the providers in the privacy policy regardless. [Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

The current app has no account creation, so its local-data removal instructions are separate from the account deletion requirement. Do not describe an account deletion feature that does not exist.

## AI release checks

- Verify a real task parse and dashboard insight using the release configuration. The previous API check returned `invalid_api_key`; an embedded key alone does not make AI work.
- Add an explicit explanation and appropriate affirmative consent before sending task text or financial totals to OpenAI. The current dashboard starts both insight requests automatically; audit this against Google's disclosure and consent requirements before launch.
- Suggested disclosure copy: “Tickd sends your pending task titles and priorities, AI task input, and income, expense and split totals to OpenAI to generate suggestions. Dashboard insights refresh when your data changes. Basic task planning works without AI.” Use separate “Enable AI” and “Continue without AI” choices and ensure declining prevents the requests. This flow is proposed copy, not implemented behaviour.
- Assess applicable [AI-generated content policy](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en) requirements, including reporting/flagging if the shipped AI functionality falls within scope.

## Bundle and listing

- Keep using `android/app/release.jks` and its saved signing properties for future uploads. Store a separate recoverable backup of both files.
- Increment `versionCode` for each new upload; set an appropriate `versionName` in `android/app/build.gradle`.
- Build with `npm run android:bundle`; upload the signed AAB from `android/app/build/outputs/bundle/release/` after the build succeeds.
- Test the signed build on a physical device: fresh install, repeating reminders, notification permission denial, task editing/deletion, wallpaper changes, finance entry deletion, offline use and AI failure/success.
- Upload the feature graphic and at least the first four matching phone screenshots from image-prompts.md. Use real UI and demo content.
- Complete target audience, IARC content rating, Data safety, app access, ads and any applicable financial-features declaration based on the final build. Budget tracking is not a payment or lending service.
- Follow any testing, verification and production-access steps displayed for your developer account. Account-specific requirements must be checked in Play Console.
