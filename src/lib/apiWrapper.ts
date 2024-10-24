import { NextApiRequest, NextApiResponse } from "next";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiWrapperCallback<ReturnType> = (
  request: NextApiRequest,
  response: NextApiResponse
) => PromiseLike<ReturnType>;

export function apiWrapper<ReturnType>(
  callback: ApiWrapperCallback<ReturnType>
) {
  return async (
    request: NextApiRequest,
    response: NextApiResponse<ReturnType>
  ) => {
    const result = await callback(request, response);
    response.status(200).json(result);
    try {
    } catch (err: any) {
      response.status(500).json({
        message: err.message,
      } as any);
    }
  };
}
