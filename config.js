import fastify from 'fastify';
import localtunnel from 'localtunnel';

export const serverPort = 3002;

// Start the tunnel right after you start your Http server using fastify (see Handling the authorization callback step)
export const tunnel = await localtunnel({
  port: serverPort,
});

export const server = fastify({
  logger: true,
});
