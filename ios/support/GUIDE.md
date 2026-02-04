# iOS Build & Live Activities Guide

This project is set up with Capacitor to run on iOS. We have added support for:
1.  **Vibration** (Haptics)
2.  **Push/Local Notifications**
3.  **Live Activities** (Dynamic Island & Lock Screen)

## Prerequisites

-   Mac with Xcode 14.1 or later.
-   Active Apple Developer Account.

## Setup Instructions

### 1. Open the Project
Open the iOS project in Xcode:
```bash
npx cap open ios
```

### 2. Configure Signing
Select the **App** project in the navigator, go to **Signing & Capabilities**, and select your Team.

### 3. Add Live Activities Support (The tricky part)

Since Live Activities require a Widget Extension, you must add a new target to the Xcode project manually.

1.  **File > New > Target...**
2.  Select **Widget Extension** (iOS) and click Next.
3.  Product Name: **BrewWidget**
4.  **Important:** Check the **"Include Live Activity"** checkbox.
5.  Click Finish.
6.  If asked to Activate scheme, say "Cancel" (you usually want to run the main App scheme).

### 4. Link Files

Now we need to replace the default generated code with our custom code.

1.  **BrewWidget.swift**:
    -   Open `ios/support/BrewWidget.swift` from this repo (or copy the content).
    -   Paste it into the newly created `BrewWidget/BrewWidget.swift` file in Xcode (replacing everything).

2.  **BrewAttributes.swift**:
    -   Find the file `App/App/BrewAttributes.swift` in the Project Navigator (it was created by our script).
    -   **Select it.**
    -   Open the **File Inspector** (Right sidebar, first tab).
    -   In the **Target Membership** section, make sure **BOTH** "App" and "BrewWidgetExtension" are checked.
    -   *Why?* The App needs it to *start* the activity, and the Widget needs it to *display* the activity.

### 5. Add Info.plist Key

1.  Open `App/App/Info.plist`.
2.  Add a new key: `NSSupportsLiveActivities` and set it to **YES** (Boolean).
3.  (Optional) Add `NSSupportsLiveActivitiesFrequentUpdates` = YES if you update often.

### 6. Build and Run

1.  Select the **App** scheme.
2.  Select your physical device (Simulators work for Lock Screen, but not all Dynamic Island features).
3.  Run the app.
4.  Start a brew. You should see the Live Activity on the Lock Screen!

## Troubleshooting

-   **"BrewAttributes not found"**: Ensure `BrewAttributes.swift` is a member of the Widget Extension target.
-   **No Live Activity appears**: Ensure you gave permission (if prompted) and that you are running iOS 16.1+.
