/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";


const getNewAccessToken = async (refreshToken: string) => {

 const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken
  };
};




export const AuthService = {
  getNewAccessToken,
};
