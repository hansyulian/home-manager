import { apiWrapper } from "~/lib/apiWrapper";

export default apiWrapper(async function () {
  return {
    alive: true,
  };
});
