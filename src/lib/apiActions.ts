/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { ApiWrapperAction } from "~/lib/apiWrapper";

export type ApiRouterCallbacks = {
  get?: ApiWrapperAction<unknown>;
  post?: ApiWrapperAction<unknown>;
  put?: ApiWrapperAction<unknown>;
  delete?: ApiWrapperAction<unknown>;
};

export function apiActions(actions: ApiRouterCallbacks) {
  return async function (request: NextApiRequest, response: NextApiResponse) {
    const { method } = request;
    let action: ApiWrapperAction<unknown> | undefined;
    switch (method) {
      case "GET":
        action = actions.get;
        break;
      case "POST":
        action = actions.post;
        break;
      case "PUT":
        action = actions.put;
        break;
      case "DELETE":
        action = actions.delete;
        break;
    }
    if (!action) {
      return response.status(500).json({
        message: "unimplemented method",
      });
    }
    try {
      request.body = JSON.parse(request.body);
      const result = await action(request, response);
      response.status(200).json(result);
    } catch (err: any) {
      response.status(500).json({
        message: err.message,
      } as any);
    }
  };
}
