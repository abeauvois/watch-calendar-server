import { google } from 'googleapis';
import crypto from 'crypto';

import { tunnel } from './config.js';

const secret = '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';

const clientId =
  '990846631760-tt2oudqqnj3imn569kj2bp1uio9k81q8.apps.googleusercontent.com';

const redirectUri = 'http://localhost:3002/callback';

const oauthState = crypto.randomBytes(32).toString('hex');

// STEP 1: Create an OAuth 2.0 client

const oAuth2Client = new google.auth.OAuth2(clientId, secret, redirectUri);

const authUrl = oAuth2Client.generateAuthUrl({
  client_id: clientId,
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/calendar.events',
  redirect_uri: redirectUri,
  state: oauthState,
});

console.log(`Authorize your application by navigating to ${authUrl}\n`);

// STEP 2: Handle the authorization callback
// Once the user authorizes this application and its requied scopes,
// Google will redirect the user to the redirect_uri you specified in the previous step.
// The redirect_uri will contain a code and a state query parameters.
// The code is a one-time authorization code that you will use to get the access token.
// The state is the same state you generated in the previous step.
// You should validate that the state you received is the same as the one you generated.
// If the state is not the same, you should reject the request.
const setCredentials = async (state, code) => {
  // Use the state generated during the authorization flow in the previous step.
  if (state !== oauthState) {
    throw new Error('Invalid state');
  }
  const {
    res: {
      data: { access_token },
    },
  } = await oAuth2Client.getToken(code);

  oAuth2Client.setCredentials({ access_token });
  google.options({ auth: oAuth2Client });
};

const getCalendar = () => {
  return google.calendar({ version: 'v3' });
};

// {
//     kind: 'calendar#event',
//     etag: '"3392359687166000"',
//     id: '601ll4f7lc4tl3qmagm3thrhd7',
//     status: 'confirmed',
//     htmlLink: 'https://www.google.com/calendar/event?eid=NjAxbGw0ZjdsYzR0bDNxbWFnbTN0aHJoZDcgYWJlYXV2b2lzQG0',
//     created: '2023-10-01T14:06:38.000Z',
//     updated: '2023-10-01T17:04:03.583Z',
//     summary: 'dim 2',
//     creator: { email: 'abeauvois@gmail.com', self: true },
//     organizer: { email: 'abeauvois@gmail.com', self: true },
//     start: { dateTime: '2023-10-01T19:31:00+02:00', timeZone: 'Europe/Paris' },
//     end: { dateTime: '2023-10-01T20:31:00+02:00', timeZone: 'Europe/Paris' },
//     iCalUID: '601ll4f7lc4tl3qmagm3thrhd7@google.com',
//     sequence: 6,
//     reminders: { useDefault: true },
//     eventType: 'default'
//   },

const getEvents = async (calendar) => {
  try {
    // Create a watch event for the next closer 10 events:
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return eventsResponse.data.items || [];
  } catch (error) {
    console.log('Google API error:', error);
    throw new Error(`Failed to get events for calendar ${calendar}`);
  }
};

const setWatcher = async (calendar, eventId) => {
  try {
    calendar.events.watch({
      resource: {
        id: crypto.randomUUID(),
        type: 'web_hook',
        address: `${tunnel.url}/webhook/event/${eventId}`,
        // token: webhookToken,
      },
      calendarId: 'primary',
    });
  } catch (error) {
    console.log('Google API error:', error);
    throw new Error(`Failed to create watcher for event ${eventId}`);
  }
};

export { authUrl, setCredentials, getCalendar, setWatcher, getEvents };
