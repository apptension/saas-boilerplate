import fastify from 'fastify';
import { WebSocketServer } from 'ws';
import Cookies from 'cookies';
import { jwtDecode } from 'jwt-decode';
import { nanoid } from 'nanoid';

import { Api } from './api.js';

const connectionsMap = {};

const wss = new WebSocketServer({ clientTracking: true, noServer: true });
const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

app.server.on('upgrade', async (request, socket, head) => {
  app.log.info('Upgrade connection');
  const cookies = new Cookies(request, null);
  const token = cookies.get('token');
  let userId = null;
  try {
    const userData = jwtDecode(token);
    userId = userData?.['user_id'] ?? null;
  } catch (e) {
    app.log.error('Unable to get user id from upgrade request');
  }
  if (!userId) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  } else {
    try {
      const connectionId = nanoid(32);
      await Api.connect(userId, connectionId);
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.connectionId = connectionId;
        connectionsMap[connectionId] = { userId, ws };
        wss.emit('connection', ws, request);
      });
    } catch (e) {
      app.log.error(e);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  }
});

app.post('/:connectionId', async (request, reply) => {
  connectionsMap[request.params.connectionId]?.ws.send(
    JSON.stringify(request.body),
  );
  return {};
});

wss.on('connection', (ws) => {
  ws.on('close', async () => {
    try {
      delete connectionsMap[ws.connectionId];
      await Api.disconnect(ws.connectionId);
    } catch (e) {
      app.log.error(e);
    }
  });
  ws.on('message', async (data) => {
    try {
      await Api.message(ws.connectionId, data);
    } catch (e) {
      app.log.error(e);
    }
  });
});

try {
  await app.listen(8080, '0.0.0.0');
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
