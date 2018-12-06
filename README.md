Exilence
[![Github All Releases](https://img.shields.io/github/downloads/viktorgullmark/exilence/total.svg)](https://github.com/viktorgullmark/exilence/releases)
===
Path of Exile tool used to track gear, currency, maps and more of you and your party. Formerly known as ExileParty.

It works just as good solo as it does in party. You could even group up with friends from different leagues to get a more social experience and staying up-to-date on each others progression.

Download latest release at https://github.com/viktorgullmark/exilence/releases/latest

Report bugs at https://github.com/viktorgullmark/exilence/issues

Communicate with us at our Discord https://discord.gg/ymr3VnA

## Video-preview

https://www.youtube.com/watch?v=3YdWM2kS4BA&t=2s

## Contents

- [Changelog](https://github.com/viktorgullmark/exilence/blob/master/CHANGELOG.md)
- [Important](#important)
- [How to install](#how-to-install)
- [Platform](#platform)
- [Help with development](#help-with-development)
- [Acknowledgements](#acknowledgements)

## Important

We do not own a code-signing certificate for the application, which means you will receive a warning the first time you launch the .exe. To get around this, just press "More info" -> "Run anyway" when it pops up, and the warning won't be displayed for you again.

## How to install

https://imgur.com/a/cBibtoF

## Platform

Currently runs with:

- .NET Core 2.1.0
- SignalR (.NET Core) 1.0.0 w/ Redis caching
- Angular v6.0.3
- Angular-CLI v6.0.3
- Electron v2.0.1
- Electron Builder v20.13.4
- Robot-JS v.2.0.0

## Help with development

If you want to help with development we gladly accept pull-requests. To set up the project, install the latest angular-cli and node version globally. The following commands will help in setting up the client:

```
npm install -g @angular/cli
npm install
npm install -g --production windows-build-tools
npm start (to serve the project)
npm run electron:windows (to build the installer for production)
```

To run the API you'll need a local redis-server. 

If you're interested in helping with development, contact us directly on discord: https://discordapp.com/invite/ymr3VnA and we'll help setting it up.

## Acknowledgements

- https://poe.ninja for providing a great API, which lets us calculate net worth of players
- https://github.com/klayveR for providing a great log-monitor to track the Client.txt
- GGG for adding additional endpoints for us and for creating a great game!