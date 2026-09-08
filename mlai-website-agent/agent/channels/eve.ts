import { eveChannel } from "eve/channels/eve";
import { localDev, UnauthenticatedError, type AuthFn } from "eve/channels/auth";

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

export default eveChannel({
  auth: standaloneAuth,
});
