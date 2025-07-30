import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import * as cookie from "cookie";
import { UnauthorizedError } from "infra/errors";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const authenticatedUser = await authentication.getAuthenticatedUser(
      userInputValues.email,
      userInputValues.password,
    );

    const newSession = await session.create(authenticatedUser.id);
    const setCookie = cookie.serialize("session_id", newSession.token, {
      value: newSession.token,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // Convert milliseconds to seconds
    });

    response.setHeader("Set-Cookie", setCookie);
    return response.status(201).json(newSession);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    throw error;
  }
}
