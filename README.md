# react-hmvc

> simple widget system, helps to control data flow in components, error boundary included

[![NPM](https://img.shields.io/npm/v/react-hmvc.svg)](https://www.npmjs.com/package/react-hmvc) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-hmvc
```

## Usage

```tsx
import React from 'react';
import { createWidget } from 'react-hmvc';

type ViewProps = {
  href: string;
  text: string;
}

const View: React.FC<ViewProps> = ({ href, text }) => (
  <a href={ href }>{ text }</a>
)

type ControllerProps = {
  id: string;
}

export const ComponentWidget = createWidget<ViewProps, ControllerProps>({
  name: '@root/ComponentWidget',
  view: View,
  controller: async ({ id }) => {
    const result = await fetch(`.../${id}`).then(res => res.json());
    return {
      href: result.href,
      text: result.text,
    }
  }
})

type WrapperComponentProps = {
  ids: string[];
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({ ids }) => (
  <>
    {
      ids.map(id => <ComponentWidget id={ id } />)
    }
  </>
)
```

Sub-components can connect to widget context and easily use widget data

```tsx
import { createWidget } from "react-hmvc";

const Widget = createWidget<ViewProps, ControllerProps>({
  name: "Widget",
  view: MainView,
  controller: () => {
    return ({
      propString: "example",
      propNumber: 123,
      propBoolean: true,
    })
  }
})

type SubViewProps = {
  propBoolean: string;
  name: string;
}

const SubView: React.FC<SubViewProps> = ({ propBoolean, name }) => {
  if (propBoolean) {
    return (
      <div>{ name }</div>
    );
  }

  return null;
}

const SubViewHook: React.FC<{name: string}> = ({ name }) => {
  const data = useWidgetData();

  return (
    <SubView propBoolean={ data.propBoolean } name={ name }/>
  );
}

const SubViewConnect = connectToWidget()(SubView)

const MainView = () => {
  return (
    <>
      <SubViewHook name="SubViewHook"/>
      <SubViewConnect name="SubViewConnect"/>
    </>
  )
}
```

## License

MIT © [saveliyshatrov](https://github.com/saveliyshatrov)
