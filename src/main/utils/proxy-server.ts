import { Server } from 'proxy-chain';
import { config } from 'dotenv';

import { requestURL } from '../network/request';

export function createProxyServer() {
  const { PROXY_USERNAME, PROXY_PASSWORD, PROXY_LINK } = config().parsed;
  const proxyServer = new Server({
    port: 8080,
    verbose: true,
    prepareRequestFunction: ({ username, password }: any) => ({
      requestAuthentication:
        username !== PROXY_USERNAME || password !== PROXY_PASSWORD,
      upstreamProxyUrl: `http://${username}:${password}@${PROXY_LINK}`,
      failMsg: 'Bad username or password, please try again.',
      onResponse: async (request: any, response: any) => {
        const url = request.url;
        try {
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
