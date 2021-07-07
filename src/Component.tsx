import * as React from 'react';

export interface IAppProps {
  name?: string;
}

export default function App(props: IAppProps) {
  return (
    <>
      <div>Hello, World!</div>
    </>
  );
}
