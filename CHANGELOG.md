# Changelog
All notable changes to this project will be documented in this file.

## [0.3.9] - 2018-07-04
- Fixed calculation for average time spent per area
- Minor optimizations throughout the app

## [0.3.8] - 2018-07-03
- Added check for undefined in map-table

## [0.3.7] - 2018-07-03
- Added summary-page for current group: displays summarized networth and gain
- Added tier to maps, to be able to filter them out
- Added events to track instance-server, to be able to track portals to the same map
- Added tabs to settings-page

## [0.3.6] - 2018-07-02
- Included items worth less than 1 chaos in income-table
- Style-changes to currency-tab
- Added decimals to item-values and networth

## [0.3.5] - 2018-07-02
- Added price per unit to income-table
- Added button to toggle graph
- Added merging of stacks from stash-tabs

## [0.3.4] - 2018-07-02
- Improved google analytics

## [0.3.3] - 2018-07-01
- Changed behavior of notification-bar

## [0.3.2] - 2018-07-01
- Added google analytics

## [0.3.1] - 2018-07-01
- Made item-tooltips more similar to how they look in-game
- Added new tab: "Areas" that tracks history of zones entered
- Added filter-functionality to income-table
- Added filter-functionality to area-table
- Added sorting by columns to income-table
- Added sorting by columns to area-table
- Added helpful link on how to find sessionId
- Added more descriptive text to login-flow
- Added settings-page to select which stash-tabs to include
- Minor style-changes across the app (header-sizes etc)

## [0.3.0] - 2018-06-29
- Fixes to notification-bar
- Added minimize-button to window
- Added maximize-button to window
- New page: "Inspect players". Lets you inspect players you've encountered recently in public parties, trades etc
- New tab: "Currency" (Next to equipment when a player is selected). Scans the first 20 tabs of a players stash and calculates the total networth with a graph to track history, powered by https://poe.ninja
- Minor style-changes across the app to make it more slim
- Added a browse-dialog to select Client.txt, with improved validation to avoid confusion

## [0.2.3] - 2018-06-26
- Tweaks to auto-updater

## [0.2.2] - 2018-06-14
- Fix for wrong connection settings

## [0.2.1] - 2018-06-14
- Prerelease adding support for recent-players (hiddden, will come later)
- Notification bar when new version is available
- Connections settings, moved API to a new host

## [0.2.0] - 2018-06-08
- Added functional version of auto-updater
- Replaced default icon
- Added working dialog when update is available

## [0.1.6] - 2018-06-05
- Fixed a bug where parties could be lowercase but displayed as uppercase
- Minor style-tweaks
- Minor UX improvements

## [0.1.5] - 2018-06-04
- Added option to scale the window-size upwards
- Now groups players by league in the current party
- Added display of current area for each player
- Progress-bars now synchronize correctly with calls to the official API
- Fixed party-name input to match uppercase
- Fixed a bug where the selected player didn't change from a player who just left
- User-experience tweaks to login-process
- Fixed a bug where settings were not saved correctly
- Fixed a bug where characters with the same name could enter the same party
- Now displays league when selecting character
- Updated readme

## [0.1.4] - 2018-05-30
- Streamlined the login-process with steps and descriptions
- Added level to character-list when logging in
- Minor visual adjustments

## [0.1.3] - 2018-05-30
- Added list of recent parties
- Fixed a bug related to entering parties
- Increased rendering time-frame for party-view
- Added additional styling to main-toolbar
- Widened login-form
- Updated readme

## [0.1.2] - 2018-05-30
- Added icon for closing the app
- Updated readme

## [0.1.1] - 2018-05-30
- Hid character-summary temporarily until finished
- Updated readme

## [0.1.0] - 2018-05-29
- Initial alpha release
