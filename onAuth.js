import {
  getCalendar,
  getEvents,
  setCredentials,
  setWatcher,
} from './googleApi.js';

const onAuth = async (request, reply) => {
  const { state, code } = request.query;

  try {
    await setCredentials(state, code);
  } catch (error) {
    return reply.status(401).send(error.message);
  }

  const calendar = getCalendar();
  const eventsList = await getEvents(calendar);

  for await (const event of eventsList) {
    setWatcher(calendar, event.id);
  }

  return reply.status(200).send();
};

export { onAuth };
