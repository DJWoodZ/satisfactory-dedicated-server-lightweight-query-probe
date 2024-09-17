const udp = require('node:dgram');

const gameState = ['Unknown', 'No game loaded', 'Creating game', 'Game ongoing'];
const protocolMagic = 0xF6D5;

/**
 * Requests data from a Satisfactory Dedicated Server's Lightweight Query API
 * @param {string} [address='127.0.0.1'] The address of the Satisfactory Dedicated Server (hostname
 * or IP)
 * @param {(number|string)} [port=7777] The port number of the Satisfactory Dedicated Server
 * @param {(number|string)} [timeout=10000] The timeout for the request (milliseconds)
 * @returns {Promise} Promise object that represents Lightweight Query API data
 */
const probe = (address = '127.0.0.1', port = 7777, timeout = 10000) => new Promise((resolve, reject) => {
  const socket = udp.createSocket('udp4');
  const now = BigInt(new Date().getTime());

  const id = setTimeout(() => {
    clearTimeout(id);
    socket.close();
    reject(new Error('Connection timed out'));
  }, parseInt(timeout, 10));

  socket.on('message', (msg) => {
    const buf = Buffer.from(msg);

    const magic = buf.readUint16LE(0);
    const messageType = buf.readUInt8(2);
    const protocolVersion = buf.readUInt8(3);

    if (magic === protocolMagic && messageType === 1 && protocolVersion === 1) {
      const payloadOffset = 4;

      const clientData = BigInt(buf.readBigUInt64LE(payloadOffset + 0));
      const serverState = gameState[buf.readUInt8(payloadOffset + 8)];
      const serverVersion = buf.readUint32LE(payloadOffset + 9);
      const serverFlags = buf.readBigUInt64LE(payloadOffset + 13);
      const numSubStates = buf.readUInt8(payloadOffset + 21);
      const subStates = [];

      for (let i = 0; i < numSubStates; i += 1) {
        subStates.push({
          id: buf.readUInt8(payloadOffset + 22 + (i * 3)),
          version: buf.readUint16LE(payloadOffset + 22 + 1 + (i * 3)),
        });
      }

      const serverNameLength = buf.readUint16LE(payloadOffset + 22 + (numSubStates * 3));

      let serverName = '';
      for (let i = 0; i < serverNameLength; i += 1) {
        serverName += String
          .fromCharCode(buf.readUInt8(payloadOffset + 24 + (numSubStates * 3) + i));
      }

      const lastByte = buf.readUInt8(payloadOffset + 24 + (numSubStates * 3) + serverNameLength);

      if (buf.length === (payloadOffset + 25 + (numSubStates * 3) + serverNameLength)
        && lastByte === 1 && clientData === now) {
        const data = {
          protocolVersion,
          clientData,
          serverState,
          serverVersion,
          serverFlags,
          subStates,
          serverName,
        };

        clearTimeout(id);
        socket.close();
        resolve(data);
        return;
      }
    }

    clearTimeout(id);
    socket.close();
    reject(new Error('Unexpected response'));
  });

  socket.on('error', (error) => {
    clearTimeout(id);
    socket.close();
    reject(error);
  });

  const buf = Buffer.alloc(13);
  buf.writeUInt16LE(protocolMagic, 0);
  buf.writeUInt8(0, 2); // Message type
  buf.writeUInt8(1, 3); // Protocol version
  buf.writeBigUInt64LE(now, 4); // Client data
  buf.writeUInt8(1, 12);

  socket.send(
    buf,
    parseInt(port, 10),
    address,
    (error) => {
      if (error) {
        clearTimeout(id);
        socket.close();
        reject(error);
      }
    },
  );
});

module.exports = {
  probe,
};
