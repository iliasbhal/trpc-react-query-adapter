import { RequestHandler } from "express";

export const beforeFetch = (url: string, options: RequestInit) => {
  const testUrl = url.toString().slice('http://localhost:3000'.length);

  const parsed = JSON.parse((options.body || {}) as any);
  const actions = testUrl.split('/').slice(2).join('/')
    .split('?').slice(0)[0]?.split(',').map((action: string, index) => {
      return [
        action,
        parsed[index]
      ];
    });

  const config = {
    method: 'POST',
    url: '/trpc',
    body: actions,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return config;
}

export const wrapTrpcExpressMiddleware = (middleware: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    const config = reconstructRequest(req)
    req.url = config.url;
    req.body = config.body;
    req.query = config.query;
    return middleware(req, res, next);
  }
}

const reconstructRequest = (req: any) => {
  const body = req.body as Record<string, any>;
  const obj = {
    url: '',
    body: {},
    query: {},
  };


  const actions = body.map(([action, input]) => action);
  const inputs = body.map(([action, input]) => input);

  obj.url = "/" + actions.join(',') + "?batch=1";
  obj.body = Object.fromEntries(
    inputs.map(
      (input, index) => [index, input]
    ),
  );

  obj.query = {
    batch: '1'
  };

  return obj;
}