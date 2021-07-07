import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface IAppProps {
  name?: string;
}

export default function App(props: IAppProps) {
  const [hosts, setHosts] = useState<String[]>(['8.8.8.8', 'example.com']);
  const [interval, setInterval] = useState<number>(1);
  const [series, setSeries] = useState<any>([]);
  const setSetting = () => {
    console.log(hosts);
    // @ts-ignore:
    window.api?.send('setting', { hosts, interval });
  };
  const initialSeries = [
    {
      name: 'Series 1',
      data: [
        { category: 'A', value: Math.random() },
        { category: 'B', value: Math.random() },
        { category: 'C', value: Math.random() },
      ],
    },
    {
      name: 'Series 2',
      data: [
        { category: 'B', value: Math.random() },
        { category: 'C', value: Math.random() },
        { category: 'D', value: Math.random() },
      ],
    },
    {
      name: 'Series 3',
      data: [
        { category: 'C', value: Math.random() },
        { category: 'D', value: Math.random() },
        { category: 'E', value: Math.random() },
      ],
    },
  ];
  useEffect(() => {
    setSeries(initialSeries);
    // @ts-ignore:
    window.api?.receive('pingdata', data => {
      const series = data.map((d: any) => {
        let name: string = '8.8.8.8';
        let data = d
          .sort((a: any, b: any) => {
            if (a.time < b.time) return -1;
            if (a.time > b.time) return 1;
            return 0;
          })
          .map((dd: any) => {
            name = dd.host;
            return { datetime: dd.time.getTime(), value: dd.ttl };
          });
        return { name, data };
      });
      setSeries(series);
    });

    return () => {};
  }, []);

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

      <LineChart width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="datetime"
          domain={['dataMin', 'dataMax']}
          allowDuplicatedCategory={false}
          tickFormatter={unixTime => new Date(unixTime).toLocaleDateString()}
          type="number"
        />
        <YAxis dataKey="value" />
        <Tooltip />
        <Legend />
        {series.map((s: any) => (
          <Line
            dataKey="value"
            dot={false}
            isAnimationActive={true}
            animationDuration={100}
            data={s.data}
            name={s.name}
            key={s.name}
          />
        ))}
      </LineChart>
    </>
  );
}
