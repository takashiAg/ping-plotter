import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import Database from './database';
import { IfindOption } from './database';
import ping from 'ping';

let DB: Database;
let win: any;
const dataPath = app.getPath('userData');
console.log(dataPath);
const databaseNameLaunchlog = 'launchlog';
const databaseNamePingData = 'pingdata';
const databaseNameSettings = 'settings';

app.whenReady().then(async () => {
  DB = new Database(
    [databaseNameLaunchlog, databaseNamePingData, databaseNameSettings],
    dataPath,
  );
  await DB.insert(databaseNameLaunchlog, { time: new Date().getTime() });
  startProcess();
});

const createWindow = (): void => {
  win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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
ipcMain.on('toMain', (event, args) => {
  win.webContents.send('fromMain', { data: 'test' });
});
ipcMain.on('setting', async (event, args) => {
  await DB.insert(databaseNameSettings, {
    interval: 1,
    hosts: ['8.8.8.8'],
    ...args,
  });
});
const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec));

const startProcess = async () => {
  startMainProcess();
  while (true) {
    await sleep(100);
    const findOption: IfindOption = {
      sortKey: 'createdAt',
      sortOrder: -1,
      limit: 1,
    };
    const findPingOption: IfindOption = {
      sortKey: 'createdAt',
      sortOrder: -1,
      limit: 100,
    };
    const { hosts } = (
      (await DB.find(databaseNameSettings, {}, findOption)) as any
    )[0];
    console.log(hosts);
    const data = await Promise.all(
      hosts.map((host: string) => {
        console.log(host);
        return DB.find(databaseNamePingData, { host }, findPingOption);
      }),
    );
    win.webContents.send('pingdata', data);
  }
};

const startMainProcess = async () => {
  let timer;
  let oldInterval = 0;
  while (true) {
    await sleep(1000);
    const findOption: IfindOption = {
      sortKey: 'createdAt',
      sortOrder: -1,
      limit: 1,
    };
    const { interval, hosts } = (
      (await DB.find(databaseNameSettings, {}, findOption)) as any
    )[0];
    if (oldInterval !== interval) {
      if (timer !== undefined) clearInterval(timer);
      timer = setInterval(() => {
        hosts.forEach(function (host: string) {
          const time = new Date(Date.now());
          ping.promise.probe(host, { timeout: 10 }).then(async function (res) {
            await DB.insert(databaseNamePingData, {
              time,
              host: res.host,
              ttl: res.time,
            });
          });
        });
      }, interval * 1000);
      oldInterval = interval;
    }
  }
};
