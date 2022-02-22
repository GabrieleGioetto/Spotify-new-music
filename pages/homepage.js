import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});

  const { access_token, refresh_token } = router.query;

  useEffect(() => {
    if (access_token) {
      fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        json: true,
      })
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log(data);

          setUser(data);
        });
    }
  }, [router]);

  return user ? <div>{user.email}</div> : <div>Loading...</div>;
};

export default Homepage;
