import { setCookie } from "../../utils/cookies";
import queryString from "query-string";
import { client_id, redirect_uri } from "../../utils/tokens";

const generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export default function handler(req, res) {
  console.log("HELLO");
  var state = generateRandomString(16);
  var stateKey = "spotify_auth_state";

  setCookie(res, stateKey, state);

  // your application requests authorization
  var scope =
    "user-read-private user-read-email user-follow-read playlist-modify-private playlist-modify-public";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      queryString.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
}
