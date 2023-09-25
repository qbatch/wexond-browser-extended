import { Server } from 'proxy-chain';
import { config } from 'dotenv';

export function createProxyServer() {
  const { PROXY_USERNAME, PROXY_PASSWORD, PROXY_LINK } = config().parsed;
  const proxyServer = new Server({
    port: 8080,
    verbose: true,
    prepareRequestFunction: () => {
      return {
        upstreamProxyUrl: `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_LINK}`,
        failMsg: 'Bad username or password, please try again.',
        onResponse: async (request: any, response: any) => {
          const url = request.url;
          try {
            response.writeHead(response.statusCode, response.headers);
            response.end(response.data, 'binary');
          } catch (error) {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Internal Server Error');
          }
        },
      };
    },
  });

  proxyServer.listen(() => {
    console.log(`Proxy server is listening on port ${proxyServer.port}`);
  });
  return proxyServer;
}
