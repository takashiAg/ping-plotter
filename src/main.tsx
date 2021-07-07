import { app, BrowserWindow } from 'electron';
import path from 'path';
import Database from './database';

let DB;
const dataPath = app.getPath('userData');
const databaseNameLaunchlog = 'launchlog';

app.whenReady().then(async () => {
  console.log(dataPath);
  DB = new Database([databaseNameLaunchlog], dataPath);
  await DB.insert(databaseNameLaunchlog, { time: new Date().getTime() });
  let data = await DB.find(databaseNameLaunchlog, {});
  console.log(data);
});

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
    },
  });

  win.loadFile('./index.html');

  // [note] devtoolを開くときは下記のコメントアウトを外す。
  // win.webContents.openDevTools();
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
