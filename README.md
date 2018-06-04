# ExileParty

Path of Exile party-app used to track gear, inventory and stats of partymembers with cross-league support.

You could use this app to either improve the party-experience with your current party, or group up with your friends from different leagues while in discord with each other to show off your character.

Download latest release at https://github.com/viktorgullmark/exile-party/releases

Report bugs at https://github.com/viktorgullmark/exile-party/issues

## Preview Images from 0.1.3a

https://imgur.com/a/czESKmz

## Contents

- [Changelog](https://github.com/viktorgullmark/exile-party/blob/master/CHANGELOG.md)
- [Important](#important)
- [Platform](#platform)
- [Upcoming changes](#upcoming-changes)
- [Help with development](#help-with-development)

## Important

We do not yet have a code-signing certificate for the application, which means you will receive a warning the first time you launch the .exe. To get around this, just press "More info" -> "Run anyway" when it pops up, and the warning won't be shown again. We're looking at options to obtain a certificate for the app.

## Platform

Currently runs with:

- .NET Core 2.1.0-rc1-final
- SignalR (.NET Core) 1.0.0-rc1-final w/ Redis caching
- Angular v6.0.3
- Angular-CLI v6.0.3
- Electron v2.0.1
- Electron Builder v20.13.4

## Upcoming changes

- Auto-updater
- Support for elder-items
- Support for divination cards
- Support for abyssal sockets w/ jewels
- Displaying DPS on item-tooltips
- Optional setting for password on parties

## Help with development

If you want to help with development we gladly accept pull-requests. To set up the project, install the latest angular-cli version globally. The following commands will help in setting up the client:

```
npm install -g @angular/cli
npm install
npm start
npm run electron:windows (to build the project)
```

See https://github.com/maximegris/angular-electron for additional commands.

To run the API you'll need a local redis-server. 

If requested I can set up an additional redis-cache in azure for developing against.

