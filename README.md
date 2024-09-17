Satisfactory Dedicated Server Lightweight Query Probe
=====================================================

A zero dependency Node.js library for probing the Lightweight Query API of a [Satisfactory Dedicated Server](https://satisfactory.fandom.com/wiki/Dedicated_servers).

Installation
------------

```
npm i @djwoodz/satisfactory-dedicated-server-lightweight-query-probe
```

Example Usage
-------------

```js
// import module
const { probe } = require('@djwoodz/satisfactory-dedicated-server-lightweight-query-probe');
```

```js
// probe using await
const data = await probe('127.0.0.1', 7777, 10000);
console.log(data);
```

```js
// probe using .then()
probe('127.0.0.1', 7777, 10000)
  .then((data) => {
    console.log(data);
  });
```

Example Response
----------------

```js
{
  protocolVersion: 1, // the protocol version
  clientData: 1726262591138n, // the unique data sent to the server (timestamp)
  serverState: 'Game ongoing', // the state of the server
  serverVersion: 366202, // the version of the server
  serverFlags: 0n, // the server flags
  subStates: [ // the sub states
    { id: 0, version: 17 },
    { id: 1, version: 1 },
    { id: 3, version: 5 },
    { id: 2, version: 1 }
  ],
  serverName: 'Satisfactory Server' // the server name
}
```

API
---

## probe([address], [port], [timeout]) ⇒ <code>Promise</code>

Requests data from a Satisfactory Dedicated Server's Lightweight Query API

**Returns**: <code>Promise</code> - Promise object that represents Lightweight Query API data

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [address] | <code>string</code> | <code>&#x27;127.0.0.1&#x27;</code> | The address of the Satisfactory Dedicated Server (hostname or IP) |
| [port] | <code>number</code> \| <code>string</code> | <code>7777</code> | The port number of the Satisfactory Dedicated Server |
| [timeout] | <code>number</code> \| <code>string</code> | <code>10000</code> | The timeout for the request (milliseconds) |