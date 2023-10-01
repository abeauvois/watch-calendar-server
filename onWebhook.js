import { server } from './config.js';
import { getCalendar, getEvents } from './googleApi.js';

const onWebhook = async (request, reply) => {
  // const resourceId = request.headers['x-goog-resource-id'];
  // const channelToken = request.headers['x-goog-channel-token'];
  // const channelId = request.headers['x-goog-channel-id'];
  const resourceState = request.headers['x-goog-resource-state'];
  console.log(
    '🚀 ~ file: server.js:83 ~ server.post ~ resourceState:',
    resourceState
  );

  // Use the channel token to validate the webhook
  // if (channelToken !== webhookToken) {
  //   return reply.status(403).send('Invalid webhook token');
  // }
  if (resourceState === 'sync') {
    return reply.status(200).send();
  }

  const calendar = getCalendar();
  const events = getEvents(calendar);

  server.log.info(events);

  return reply.status(200).send('Webhook received');
};

export { onWebhook };
