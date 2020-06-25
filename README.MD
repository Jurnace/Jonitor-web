# Jonitor-web
Jonitor-web is a web application built using React and Chart.js. It connects to the WebSocket created by [Jonitor](https://www.github.com/Jurnace/Jonitor) and display the data in the form of graphs.
![Screenshot](https://i.imgur.com/xccy14u.png)

## Installation
1. Clone `git clone https://github.com/Jurnace/Jonitor-web.git` or download this repository.
2. `npm install`

## Usage
### Development server
```bash
npm start
```
This runs `webpack-dev-server` on http://localhost:3000. Jonitor has to be running and `webpack-dev-server` will redirect http://localhost:3000/ws to http://localhost:10113/ws.

### Production build
```bash
npm run build
```
Production ready files can be found in `/dist`

<br>Icons used in this project are from [Material Icons](https://material.io/resources/icons) and [Twemoji](https://twemoji.twitter.com/).