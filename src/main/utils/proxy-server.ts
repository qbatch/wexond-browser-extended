import { Server } from 'proxy-chain';
import { config } from 'dotenv';

import { requestURL } from '../network/request';

export function createProxyServer() {
  console.log('called Proxy server');
  console.log('data:', process.env);

  const proxyServer = new Server({
    port: 8080,
    verbose: true,
    prepareRequestFunction: ({ username, password }) => ({
      requestAuthentication:
        username !== config().parsed.PROXY_USERNAME ||
        password !== config().parsed.PROXY_PASSWORD,
      upstreamProxyUrl: `http://${username}:${password}@${
        config().parsed.PROXY_LINK
      }`,
      failMsg: 'Bad username or password, please try again.',
      onResponse: async (request: any, response: any) => {
        console.log(request.url);
        const url = request.url;
        try {
          console.log(url, 'hello');

          const responseDetails = await requestURL(url);
          response.writeHead(responseDetails.statusCode, response.headers);
          response.end(responseDetails.data, 'binary');
        } catch (error) {
          response.writeHead(500, { 'Content-Type': 'text/plain' });
          response.end('Internal Server Error');
        }
      },
    }),
  });

  proxyServer.listen(() => {
    console.log(`Proxy server is listening on port ${proxyServer.port}`);
  });
  return proxyServer;
}
