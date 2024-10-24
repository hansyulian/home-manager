import { NextApiRequest, NextApiResponse } from "next";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiWrapperAction<ReturnType> = (
  request: NextApiRequest,
  response: NextApiResponse
) => PromiseLike<ReturnType>;

export function apiWrapper<ReturnType>(action: ApiWrapperAction<ReturnType>) {
  return async (
    request: NextApiRequest,
    response: NextApiResponse<ReturnType>
  ) => {
    try {
      const result = await action(request, response);
      response.status(200).json(result);
    } catch (err: any) {
      response.status(500).json({
        message: err.message,
      } as any);
    }
  };
}
