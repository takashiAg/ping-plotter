import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Database from './database';
export interface IAppProps {
  name?: string;
}

export default function App(props: IAppProps) {
  const [hosts, setHosts] = useState<String[]>(['8.8.8.8', 'example.com']);
  const [interval, setInterval] = useState<number>(1);
  const setSetting = () => {
    console.log(hosts);
    // @ts-ignore:
    window.api?.send('setting', { hosts, interval });
  };
  return (
    <>
      <TextField
        label="interval time"
        fullWidth
        type="number"
        value={interval}
        onChange={e => setInterval(Number(e.target.value) || 1)}
        placeholder="ex) 1 then send ping every second"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="host"
        fullWidth
        type="string"
        value={hosts.join('\n')}
        onChange={e => setHosts(e.target.value.split('\n'))}
        placeholder="8.8.8.8"
        multiline
        InputLabelProps={{
          shrink: true,
        }}
      />
      {/* <TextField
        label="interval time"
        fullWidth
        type="number"
        placeholder="ex) 1 then send ping every second"
        InputLabelProps={{
          shrink: true,
        }}
      /> */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={setSetting}>
        設定する
      </Button>
    </>
  );
}
