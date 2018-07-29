# Changelog
All notable changes to this project will be documented in this file.

## [0.5.4] - 2018-07-XX
- Added game-overlay for personal net worth (Currency -> Pop out)
- Added validation of sessionId when logging in
- Added placeholder-block for inventory when no sessionId has been provided
- Added keybind-text to report-buttons (to show which keybind it has)
- Stashtab-settings are now disabled if no sessionId has been provided
- Minor style-adjustments to area-tab
- Fixed a bug where the selected players values were posted instead of the current players (yourself)
- Reduced delay before snapshotting when changing areas (QoL-change)
- Now snapshots on login, and not only upon entering your first area (QoL-change)
- Changed application-name from 'exile-party' to 'ExileParty'
- Changed timestamp for areas to reflect the time when you leave the area, instead of when you enter it

## [0.5.3] - 2018-07-21
- Added support to store extended currency-history for yourself (up to one week)
- Added support to store extended area-history for yourself (up to one week)
- Added pagination to area-table (10 per page)
- Added button to reset area-history
- Fixed a bug where the current tab was not always selected
- Fixed inspect-players tab, should now work as usual again
- Fixed a bug where the group-summary page was not always up-to-date
- Added ExileParty-tag to report-messages
- Improved form-validation to login-form
- Style-improvements to ladder-tab
- Style-improvements to area-tab

## [0.5.2] - 2018-07-18
- Hotfix for external framework not loading (robot-js)

## [0.5.1] - 2018-07-18
- Changed default keybindings
- Keybinds now only work with Path of Exile or ExileParty in focus
- Added the ability to disable individual keybinds
- Added support for F1-F12 as trigger-keys
- Added descriptive text to keybinds-page
- Added league-selection to login-page
- Added ranking to player-badge (if player is on ladder)
- Fixed a bug where buttons sometimes overlapped in the currency-tab

## [0.5.0] - 2018-07-14
- Added first version of keybindings (Settings -> Keybinds)
- Added new tab "Ladder": shows your ranking and the players next to you on the ladder
- Added link to player-profile next to equipment
- Reworked how gain is calculated to be more accurate
- Added the ability to click on snapshots in the graph for a player, to display the items and net worth at that timestamp
- Fixed a bug where players weren't disconnected properly after party was dropped due to inactivity
- Fixed a bug where you could select two players at the same time
- Fixed a bug for SSF leagues where net worth was not calculated
- Fixed a bug where abyssal sockets weren't shown
- Fixed a bug where gain wasn't shown correctly on summary-view
- Fixed a bug where the summary-view wasn't updated correctly
- Fixed a bug where history wasn't cleared properly when resetting graph
- Fixed how timestamps are compared when events occur
- Improved styling of shaper/elder-items
- Now redirects to disconnect-page when pathofexile.com is down

## [0.4.6] - 2018-07-09
- Added support for elder items
- Added support for shaper items
- Added support for prophecies
- Added support for divination cards
- Added support for SSF Standard
- Added support for SSF Hardcore
- Added icon for unmaximizing the window after it has been maximized
- Changed text from "Fetching data" to "No data" to be more accurate
- Added price-information for SSF leagues (based on counterpart trade-league)
- White gems in green sockets should now be displayed correctly
- Minor style-changes to item-tooltips

## [0.4.5] - 2018-07-08
- Hotfix for areas not being timed properly

## [0.4.4] - 2018-07-08
- Added support for lower resolutions (down to 1344x768px)
- Added placeholder-text for when player hasn't entered any areas yet
- Added always-on-top setting under the "Settings"-page
- Added redirect to disconnection-page on startup if server is not reachable
- Added QoL-improvements to when net worth is calculated
- Added Google Analytics information-text to login-page
- Reduced data-traffic sent and received by using compression (gzip)
- Fixed a bug where longer group-names would overflow when listed on the dashboard
- Removed menu from disconnect-page
- Changed Patreon-url

## [0.4.3] - 2018-07-08
- Fix for values doubling up for some players when changing zones
- Added Patreon-link on dashboard

## [0.4.2] - 2018-07-06
- Restored map-functionality, instance-servers should now work
- Added logout when disconnected from server
- Added informative page if disconnection would occur

## [0.4.1] - 2018-07-05
- Added informative text on how to fetch character-list
- Masked sessionId to make it easier for streamers/content-creators to use the app on stream
- Added scroll to player-list to allow for larger groups
- Added support for abyssal-sockets
- Improvements for snapshotting of players and fetching of price-information
- Bug-fix for stash-tabs not being selected properly when targeted in the header

## [0.4.0] - 2018-07-04
- Improved descriptions throughout the app
- Minor tweaks to summary-graph
- Initial beta-release

## [0.3.12] - 2018-07-04
- Fixed a bug related to rendering of graph

## [0.3.11] - 2018-07-04
- Hotfix for summary-graph: color-adjustments

## [0.3.10] - 2018-07-04
- Hotfix for graph not updating properly when players reset their net worth stats

## [0.3.9] - 2018-07-04
- Added graph to group-summary
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
