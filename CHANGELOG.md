# Changelog
All notable changes to this project will be documented in this file.

## [0.9.8] - 2019-XX-XX
- Updated Electron framework
- Removed functionality for sending messages

## [0.9.8] - 2019-01-15
- Added a setting for chosing how many days to track net worth history for
- Reworked how connections are initiated on the server
- Fixed a bug where flasks weren't properly displayed when in inventory

## [0.9.7] - 2019-01-12
- Fixed a bug related to rate-limit when fetching stash-tabs
- Temporarily disabled networth file-output until further investigation

## [0.9.6] - 2019-01-12
- Fixed a bug where connection wasn't re-established on disconnect

## [0.9.5] - 2019-01-12
- Added support to price the maptab (requires it to be public)
- Added column for gem-level in the net worth table
- Added tooltip to value in networth table to display more detailed data such as average, mode and mean
- Added colors to names for items in the net worth table, based on rarity
- Added file-output for gain and networth values, making it available for import in OBS
- Fixed a bug where maps in regular tabs werent included in the pricing
- Fixed a bug where the gain-table didn't display new items, only the difference between current ones
- Fixed a bug where the gain-table didn't display removed items properly
- Fixed a bug where items of zero value would sometimes be included in pricing
- Now starts pricing every three minutes, down from five, to counter increased snapshot-times with the maptab
- Now displays a loading-bar when entering party
- Reworked dashboard (removed old sections and added changelog for current version)
- Reworked how masking works, now always masks the first group if the setting is enabled 
- Updated the FAQ-page
- Updated SignalR package
- Removed negotiate-step for websockets, now connects directly instead
- Minor style tweaks to net worth table

## [0.9.4] - 2018-12-31
- Opened up a Patreon to allow support
- Fixed a bug where group net worth was not summarized correctly in the list
- Fixed a bug where group summary page was not updating properly
- Area-count is now limited to 1000, and can not exceed this length
- Added a chaos orb icon when displaying net worth and gain
- Removed parsing of Client.txt to avoid RAM-issues (might be reworked later)
- Removed Application Insights from client

## [0.9.3] - 2018-12-26
- Reworked internal statistics endpoint to fix bug where the unintentionally prolonged party persistance
- Added flashing of taskbar icon on new Exilence version
- Fixed a bug where prices were wrong for prophecies and divination cards with the same name

## [0.9.2] - 2018-12-20
- Added support for scarabs/fragments/vessels and other common items in net worth
- Added support for abyssal sockets when pricing uniques
- Added proper backgrounds for elder/shaper items
- Added a loading-indicator on the new login-screen
- Added a popup to display important server-notifications
- Fixed a bug where existing items would sometimes be mismatched
- Minor style-tweaks to net worth table

## [0.9.1] - 2018-12-20
- Fixed a bug where the net worth pricing would stop when poe.watch is down
- Fixed a bug where some bases would always be priced at 1 chaos
- Fixed a bug where unidentified items were wrongly price

## [0.9.0] - 2018-12-19
- Added support for pricing of scarabs
- Added support to price linked items
- Added support to price 6-socketed items
- Added support to price elder/shaper items
- Added support for pricing gems (with level and quality)
- Added support to price basetypes (with and without elder/shaper)
- Added new column 'links' to net worth table
- Added new column 'quality' to net worth table
- Pricing of items should now be more accurate
- Added a new, simplified launch-screen for existing users
- Added persistance between restarts to mask-setting for groupnames
- Fixed a bug where gain for the group summary was not updated properly

## [0.8.12] - 2018-12-18
- Optimized memory usage by dropping disposing of unused objects
- Fixed a bug where the gain per hour in the currancy summary tab wasn't updated properly
- Fixed a bug where items with zero quantity were listed in the gain-over-time table
- Now displays two decimals for all net worth values
- Now logs screenviews for Google Analytics properly
- Now defaults to first 4 stashtabs instead of 10 (to support players with fewer tabs)
- Fixed a bug where area export would crash if no areas were present
- Added the ability to resize the networth popout
- The networth popout is now hidden from the taskbar
- Added CSV-export for income (Send report -> Full export)
- Removed the default path for client.txt during login to avoid confusion
- Ladder now displays top 10 if the current character is not present.

## [0.8.11] - 2018-12-13
- Added setting for gain-hours (you can now choose how many hours back calculations for hourly gain are based on)
- Added new table in currency summary, that displays the net worth change over time (based on gain-hours)
- Optimizations for retrieval of ladder
- Now shows time from last snapshot for each player in currency summary
- Reworked currency and currency summary tabs (more improvements to come)

## [0.8.10] - 2018-12-13
- Now rejoins your last group when reconnected after a disconnect (if they occurr within 25 seconds of each other)

## [0.8.9] - 2018-12-11
- Now flashes the taskbar icon when disconnected
- Now includes items/stacks worth less than 1c in net worth (previously these were excluded)
- Added inventory to net worth calculations (with setting in Settings -> Net worth)
- Added equipment to net worth calculations (with setting in Settings -> Net worth)
- Added ability to select item-value treshold (with setting Settings -> Net worth)
- Now shows a separate disconnect-page if the cause is external (e.g if Path of Exile is down)
- Changed the app-icon for Exilence
- Fixed a bug where experience per hour was not displayed in the ladder-tab
- Fixed a bug where the ladder-tab was not immediately updated when entering a party
- Fixed a bug where a default-setting was not properly set for some options
- Fixed a bug where analytics screen-views were inproperly triggered
- Fixed a problem that was causing memory to leak (taking too much memory in long sessions)

## [0.8.8] - 2018-12-09
- Fixed a bug where some clients were sending too much data to the server
- Fixed a bug where clients were requesting ladders too often
- Fixed a bug where abyssal sockets were not displayed on items

## [0.8.7] - 2018-12-08
- Now shares the past 24 hours of data with your group, up from 1 hour
- Ladders are now fetched 4 times as often as before (in effect after next server maintenance)
- Added option to mask your groupname (for streamers etc), password-protection will be added in the future
- Fixed a bug with pricing, where many items were not included even though good confidence
- Fixed a bug where DPS on weapons was not shown correctly
- Fixed a bug where too much net worth history was being sent
- Fixed a bug where net worth snapshots would sometimes stop
- Added better description for net worth tab if no history is present
- Added changelog-link to dashboard
- Now shows when last the snapshot occurred, next to gain/net worth
- Changed text for pop out button, now called 'Use overlay'

## [0.8.6] - 2018-12-07
- Added a line of text to disconnected-page that tells you to accept ToS at pathofexile.com

## [0.8.5] - 2018-12-07
- Changed price-confidence to be more strict
- Changed interval for fetching prices (now every 10 minutes, previously once every hour)
- Minor QoL-improvements to login-process, with more descriptive text

## [0.8.4] - 2018-12-06
- Added support for new atlas (3.5)
- Added option to include/exclude low confidence prices (excluded by default)
- Reformatted timestamps for net worth graph
- Changed the default stashtab-selection to the 10 first tabs, up from 5
- Style-tweaks to disconnected-page
- Fixed an error where Delve-leagues could still be selected
- Improved tutorial-tooltips

## [0.8.3] - 2018-12-06
- Added a direct restart-link to updatenotification-toolbar
- Added initial support for veiledmods
- Added pricing for fossiles and resonators
- Reworked how the API stores leagues with ladders
- Fixed a bug where export-button was visible even when you were not selected
- Removed .NET Core sessions from API (to optimize requests)

## [0.8.2] - 2018-12-04
- Hotfix for messaging not being sent to party

## [0.8.1] - 2018-12-03
- Fixed net worth overlay (should now update properly)
- Fixed macros (should now show correct values)
- Improved formatting of net worth timestamps
- Rewrote functionality of how connections are handles to reduce API load

## [0.8.0] - 2018-12-03
- Renamed the app to Exilence (former ExileParty)
- Improved performance for players with large area-history
- Improved ladder-functionality
- Added export-button(.csv) for areas
- Added help-section under settings, with the ability to send your log-file to us
- Added informative header in center of inspect-players page
- Now stores net worth history for two weeks until storage issues have been resolved
- Fixed rounding of DPS-numbers
- Fixed a bug where some areas would be missing when parsing the log
- Fixed window-boundaries when using the resizable option
- Changed texts on some buttons in the login-process

## [0.7.3] - 2018-11-26
- Added DPS/pDPS/eDPS to weapon-tooltips
- Added a column that shows which players has an item in the group summary table 
- Fixed a bug where snapshots didnt get triggered on zone-change
- Fixed a bug where you could select all stash-tabs (max is 20)
- Minor style-tweaks

## [0.7.2] - 2018-11-22
- Hotfix for missing logo (again)

## [0.7.1] - 2018-11-22
- Hotfix for missing logo

## [0.7.0] - 2018-11-22
- Fixed date-column in map-tab, should now be accurate and show additional information
- Fixed time-column in map-tab, should now be accurate
- Changed how duration is calculated for areas to be more reliable
- Now hides zones which you've been in for more than 30 minutes (probable logout)
- Added option to choose what zones to track (maps only, or all zones)
- Added the ability to import your Client.txt (to see all your maphistory)
- Added support for private profiles (requires a sessionId to work)
- Reworked handling of area-events to be more accurate
- Added a setting to enable/disable resizing of the window, instead of setting it enabled by default
- Added Discord-link to sidemenu
- Changed the layout of the league-selection step in the login-process to be more descriptive
- Now saves history for net worth and areas forever (for yourself only)
- Messages are now posted to your current party instead of local chat
- Reworked layout for some of the tabs on the settings-page
- Minor style-tweaks/fixes

## [0.6.1] - 2018-11-17
- Increased the time you can be inactive before getting kicked from the server (now 1 hour instead of 15 min)
- Added support to choose which league prices should be fetched from (for SSF/private-leagues that doesn't have pricing)
- Added a popup for clearing history if you change to another league when logging in
- Added a limit to how often messages can be sent to the game (every 1½ second)
- Replaced poe-racing.com-implementation with our own ladder-endpoint
- Added ladder-parsing for private-leagues
- Now autocompletes to the last step of the login-process if you have all settings stored
- Now auto-selects trade-league for you if the league selected is a trade-league to avoid mistakes
- Reworked keybind-events to be more reliable (using a new framework)
- Added a global setting to hide tutorial-tooltips (found under general)
- Improved the behaviour of the currency-calculations
- Increased width of popout-window 

## [0.6.0] - 2018-11-15
- Added support for private-leagues
- Added a tutorial (helper-tooltips) that will be shown the first time you launch Exilence
- Added a FAQ-page, listing frequently asked questions with answers
- Added language-support (now displays timestamps within the app in your system language)
- Added a general tab to the settings-page
- Added a button to reset helper-tooltips
- Improved reconnect-functionality to avoid infinite loop when party has expired
- Fixed a bug where item-names werent displayed properly after an update from GGG
- Changed hosting-provider for servers
- Removed case-sensitivity in the path for the client.txt-file
- Minor bugfixes and code-cleanup

## [0.5.5] - 2018-09-07
- Added reconnect functionality, now tries to reconnect five times before disconnecting.
- Added relaunch button to disconnect screen.

## [0.5.4] - 2018-08-01
- Added game-overlay for personal net worth (Currency -> Pop out)
- Added validation of sessionId when logging in
- Added placeholder-block for inventory when no sessionId has been provided
- Added keybind-text to report-buttons (to show which keybind it has)
- Added support for future leagues and events (leagues are now listed dynamically)
- Added validation for max-count when selecting stash-tabs in settings, and displays error if exceeded
- Added the ability to remove groups from the recent-groups list on dashboard
- Made item-tooltips more compact by reducing the line-height
- Stashtab-settings are now disabled if no sessionId has been provided
- Minor style-adjustments across the app with improved responsitivity
- Fixed a bug where the selected players values were posted instead of the current players (yourself)
- Fixed a bug where history-updates weren't correctly shared with the rest of the group
- Fixed a bug where the player-list on the inspect-players page would exceed the window-height
- Reduced delay before snapshotting when changing areas (QoL-change)
- Now displays a notification-bar in the bottom when area- and networth-history is cleared
- Now snapshots on login, and not only upon entering your first area (QoL-change)
- Changed application-name from 'exilence' to 'Exilence'
- Changed timestamp for areas to reflect the time when you leave the area, instead of when you enter it

## [0.5.3] - 2018-07-21
- Added support to store extended currency-history for yourself (up to one week)
- Added support to store extended area-history for yourself (up to one week)
- Added pagination to area-table (10 per page)
- Added button to reset area-history
- Fixed a bug where the current tab was not always selected
- Fixed inspect-players tab, should now work as usual again
- Fixed a bug where the group-summary page was not always up-to-date
- Added Exilence-tag to report-messages
- Improved form-validation to login-form
- Style-improvements to ladder-tab
- Style-improvements to area-tab

## [0.5.2] - 2018-07-18
- Hotfix for external framework not loading (robot-js)

## [0.5.1] - 2018-07-18
- Changed default keybindings
- Keybinds now only work with Path of Exile or Exilence in focus
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
