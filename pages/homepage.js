import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading, Text, Container, Checkbox, Button } from "@nextui-org/react";
import ModalNewReleases from "../components/ModalNewReleases";
import { handleShowNewReleases } from "../utils/api_calls";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userArtists, setUserArtists] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal handler
  const [visible, setVisible] = useState(false);

  const { access_token, refresh_token } = router.query;

  useEffect(() => {
    if (access_token) {
      const fetchUser = async () => {
        const userResponse = await fetch("https://api.spotify.com/v1/me", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + access_token,
          },
          json: true,
        });
        const userData = await userResponse.json();
        setUser(userData);
      };

      const fetchUserArtists = async () => {
        // Spotify API only returns 50 artists maximum at a time
        let notFinished = true;

        let allUserArtistsData = [];
        let link =
          "https://api.spotify.com/v1/me/following?type=artist&limit=50";

        while (notFinished) {
          const userArtistsResponse = await fetch(link, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + access_token,
            },
            json: true,
          });
          const userArtistsData = await userArtistsResponse.json();
          allUserArtistsData = allUserArtistsData.concat(
            userArtistsData.artists.items
          );

          next = userArtistsData.artists.next;

          console.log(userArtistsData);
          if (next == null) {
            notFinished = false;
          } else {
            link = next;
          }
        }

        console.log(allUserArtistsData);

        setUserArtists(allUserArtistsData);
        setSelectedArtists(allUserArtistsData.map((artist) => artist.id));
      };

      fetchUser();
      fetchUserArtists();
    }
  }, [router]);

  return user?.email ? (
    <Container
      display="flex"
      direction="column"
      alignItems="center"
      css={{
        "> *": {
          marginBottom: "$9 !important",
        },
        marginTop: "$3",
      }}
    >
      <Text
        h1
        size={60}
        css={{
          textGradient: "45deg, $blue500 -20%, $pink500 50%",
        }}
        weight="bold"
      >
        Hello {user.display_name}
      </Text>
      <Text
        h3
        size={30}
        css={{
          textGradient: "45deg, $purple500 -20%, $pink500 100%",
        }}
        weight="bold"
      >
        Choose the artists that you want to see on your playlist
      </Text>

      <Checkbox.Group
        color="success"
        row
        css={{
          display: "flex",
          flexWrap: "wrap",
        }}
        value={selectedArtists}
        onChange={setSelectedArtists}
      >
        {userArtists.map((artist) => (
          <Checkbox
            css={{ padding: "$2" }}
            color="primary"
            value={artist.id}
            size="sm"
          >
            {artist.name}
          </Checkbox>
        ))}
      </Checkbox.Group>

      <Button
        css={{ margin: "$2" }}
        onClick={() =>
          handleShowNewReleases({
            selectedArtists,
            access_token,
            setNewAlbums,
            setVisible,
            setLoading,
          })
        }
        disabled={loading}
      >
        {loading ? <Loading color="white" size="sm" /> : `Show new Releases`}
      </Button>
      <ModalNewReleases
        visible={visible}
        setVisible={setVisible}
        access_token={access_token}
        newAlbums={newAlbums}
        user_id={user.id}
      />
    </Container>
  ) : (
    <Container
      css={{ height: "90vh" }}
      alignItems="center"
      justify="center"
      display="flex"
      direction="row"
      fluid={true}
    >
      <Loading type="points"> Loading </Loading>
    </Container>
  );
};

export default Homepage;
