import queryString from "query-string";
import { client_id, client_secret, redirect_uri } from "../../utils/tokens";

export default async function handler(req, res) {
  console.log("CALLBACK");

  // your application requests refresh and access tokens
  // after checking the state parameter

  var stateKey = "spotify_auth_state";

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log({ code, state, storedState });

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        queryString.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log("1");
        // res.status(200).json(data);

        const access_token = data.access_token;
        const refresh_token = data.refresh_token;

        const options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        console.log("2");

        // use the access token to access the Spotify Web API
        // request.get(options, function (error, response, body) {
        //   console.log(body);
        // });

        // fetch("https://api.spotify.com/v1/me", {
        //   method: "GET",
        //   headers: {
        //     Authorization: "Bearer " + access_token,
        //   },
        //   json: true,
        // })
        //   .then((response) => {
        //     console.log(response);
        //     return response.json();
        //   })
        //   .then((data) => {
        //     console.log(data);
        //     console.log("3");
        //   });

        // console.log("4");

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/homepage?" +
            queryString.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      })
      .catch((error) => {
        res.status(500).json(error);
        res.redirect(
          "/#" +
            queryString.stringify({
              error: "invalid_token",
            })
        );
      });
  }
}
