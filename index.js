const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const fs = require('fs');
const { traceProcessWarnings } = require('process');

let mainWindow; 
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 985,
        height: 655,
        frame: false,
        titleBarStyle: 'hidden',
        icon: __dirname + '/icon.png',
        transparent: true,
        webPreferences: { 
          nodeIntegration: true
        } 
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
});

ipcMain.on('note:save', (event, note) => {
    let unpackedNote = JSON.parse(note);
    fs.writeFile(`${__dirname}/notes/` + unpackedNote.title + '.txt', unpackedNote.value, function (err) {
        if (err) throw err;
        console.log('Saved!');
    })
});

ipcMain.on('app:exit', () => {
    app.quit();
});

ipcMain.on('app:minimize', () => {
    mainWindow.minimize();
})

ipcMain.on('app:maximize', () => {
    mainWindow.maximize();
})

ipcMain.on('app:unmaximize', () => {
    mainWindow.unmaximize();
})

ipcMain.on('note:delete', (event, path) => {
    fs.unlink(`${__dirname}/notes/` + path, (err) => {
        if (err) {
            console.error(err);
            return;
        } else {
            mainWindow.webContents.send('note:deleted');
        }
    });
});