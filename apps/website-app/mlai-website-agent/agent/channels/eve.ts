import { eveChannel } from "eve/channels/eve";
import {
  localDev,
  routeAuth,
  UnauthenticatedError,
  type AuthFn,
} from "eve/channels/auth";

const developmentAuth = localDev();

export const standaloneAuth: AuthFn<Request> = async (request) => {
  if (!request.headers.has("authorization")) {
    const localSession = await developmentAuth(request);
    if (localSession) return localSession;
  }

  throw new UnauthenticatedError({
    code: "mlai_agent_not_deployable",
    message:
      "Standalone MLAI agent access is disabled until application-owned authorization is integrated.",
  });
};

const channel = eveChannel({
  auth: standaloneAuth,
});

// Eve callbacks use their own capability tokens. They must also pass the
// standalone boundary; no continuation surface may bypass production refusal.
export default {
  ...channel,
  routes: channel.routes.map((route) => {
    if (route.path === "/eve/v1/health") return route;
    return {
      ...route,
      handler: async (...args: Parameters<typeof route.handler>) => {
        const authorization = await routeAuth(args[0], standaloneAuth);
        if (authorization instanceof Response) return authorization;
        return route.handler(args[0], args[1]);
      },
    };
  }),
};
