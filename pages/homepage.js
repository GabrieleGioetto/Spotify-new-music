import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading, Text, Container, Checkbox, Button } from "@nextui-org/react";
import ModalNewReleases from "../components/ModalNewReleases";
import { getUniqueListBy } from "../utils/functions";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userArtists, setUserArtists] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

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

  const handleShowNewReleases = async () => {
    let allAlbums = [];

    let albumsPromises = [];

    const getAlbumsPromises = ({ include_groups = "albums" }) => {
      let promises = [];

      for (let i = 0; i < selectedArtists.length; i++) {
        const artistId = selectedArtists[i];

        promises.push(
          fetch(
            `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=${include_groups}`,
            {
              method: "GET",
              headers: {
                Authorization: "Bearer " + access_token,
              },
              json: true,
            }
          )
        );
      }

      return promises;
    };

    // TODO: add feature to choose only album/singles
    // Add albums and singles
    albumsPromises = [
      ...getAlbumsPromises({ include_groups: "album" }),
      ...getAlbumsPromises({ include_groups: "single" }),
    ];

    const responses = await Promise.all(albumsPromises);
    let newAlbumsData = await Promise.all(
      responses.map((r) => {
        return r.json();
      })
    );

    allAlbums = newAlbumsData.flatMap((artistAlbums) => artistAlbums.items);

    const filterDate = new Date();
    filterDate.setMonth(filterDate.getMonth() - 1);

    allAlbums = allAlbums.filter((album) => {
      const release_date = new Date(album?.release_date);
      return release_date >= filterDate;
    });

    console.log(allAlbums);

    allAlbums = getUniqueListBy(allAlbums, "id");

    console.log(allAlbums);

    // Default: all albums selected
    setNewAlbums(allAlbums);

    setVisible(true);
  };

  return user?.email ? (
    <Container
      display="flex"
      direction="column"
      alignItems="center"
      css={{
        "> *": {
          marginBottom: "$8",
        },
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

      <Button css={{ margin: "$2" }} onClick={handleShowNewReleases}>
        Show new Releases
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
