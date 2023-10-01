/* eslint-disable no-irregular-whitespace */
import { server, serverPort } from './config.js';
import { getCalendar, getEvents } from './googleApi.js';

import { onAuth } from './onAuth.js';
import { onWebhook } from './onWebhook.js';

server.get('/callback', { logLevel: 'error' }, onAuth);

server.post('/webhook', { logLevel: 'error' }, onWebhook);

server.post(
  '/webhook/event/:eventId',
  { logLevel: 'error' },
  async (request, reply) => {
    const { eventId } = request.params;
    const resourceState = request.headers['x-goog-resource-state'];
    const channelId = request.headers['x-goog-channel-id'].slice(0, 6);
    console.log('resourceState:', resourceState);
    console.log('channelId:', channelId);
    console.log('request.headers:', request.headers);

    // const channelToken = request.headers['x-goog-channel-token'];
    // if (channelToken !== webhookToken) {
    //   return reply.status(403).send('Invalid webhook token');
    // }

    const calendar = getCalendar();
    const events = await getEvents(calendar);
    console.log(
      '🚀 ~ file: server.js:31 ~ events:',
      events.map((e) => ({
        id: e.id.slice(0, 6),
        summary: e.summary,
        start: e.start,
        end: e.end,
      }))
    );

    if (resourceState === 'sync') {
      return reply.status(200).send();
    }
    server.log.info(`Webhook event for ${eventId}`);
  }
);

const startHttpServer = async () => {
  try {
    await server.listen(serverPort);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startHttpServer();
