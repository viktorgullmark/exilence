ExileParty
[![Github All Releases](https://img.shields.io/github/downloads/viktorgullmark/exile-party/total.svg)](https://github.com/viktorgullmark/exile-party/releases)
===
Path of Exile party-app used to track gear, inventory, currency and more of partymembers with cross-league support.

You could use this app to either improve the party-experience with your current party, or group up with your friends from different leagues while in discord with each other to show off your character.

Download latest release at https://github.com/viktorgullmark/exile-party/releases/latest

Report bugs at https://github.com/viktorgullmark/exile-party/issues

## Screenshots from 0.4.0b

https://imgur.com/a/cpODf7I

## Contents

- [Changelog](https://github.com/viktorgullmark/exile-party/blob/master/CHANGELOG.md)
- [Important](#important)
- [Platform](#platform)
- [Help with development](#help-with-development)
- [Acknowledgements](#acknowledgements)

## Important

We do not own a code-signing certificate for the application, which means you will receive a warning the first time you launch the .exe. To get around this, just press "More info" -> "Run anyway" when it pops up, and the warning won't be displayed for you again.

## Platform

Currently runs with:

- .NET Core 2.1.0
- SignalR (.NET Core) 1.0.0 w/ Redis caching
- Angular v6.0.3
- Angular-CLI v6.0.3
- Electron v2.0.1
- Electron Builder v20.13.4

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

## Acknowledgements

Huge thanks to https://poe.ninja for providing a great API, which lets us calculate net worth of players.

Thanks to https://github.com/klayveR for providing a great log-monitor to track the Client.txt.

And a thank you to GGG for creating this game!

