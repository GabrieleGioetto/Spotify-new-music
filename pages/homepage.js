import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getTodayDate } from "../utils/dates";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userArtists, setUserArtists] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [playlist, setPlaylist] = useState({});

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
        const userArtistsResponse = await fetch(
          "https://api.spotify.com/v1/me/following?type=artist",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + access_token,
            },
            json: true,
          }
        );
        const userArtistsData = await userArtistsResponse.json();
        setUserArtists(userArtistsData.artists.items);
      };

      fetchUser();
      fetchUserArtists();
    }
  }, [router]);

  const handleShowNewReleases = async () => {
    let allAlbums = [];

    for (let i = 0; i < userArtists.length; i++) {
      const artistId = userArtists[i].id;

      const getAlbums = async ({ include_groups = "albums" }) => {
        const newAlbumsResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=${include_groups}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + access_token,
            },
            json: true,
          }
        );
        let newAlbumsData = await newAlbumsResponse.json();
        newAlbumsData = newAlbumsData.items;

        const filterDate = new Date();
        filterDate.setMonth(filterDate.getMonth() - 1);

        newAlbumsData = newAlbumsData.filter((album) => {
          const release_date = new Date(album.release_date);
          return release_date >= filterDate;
        });

        return newAlbumsData;
      };

      // TODO:  Do a promise all
      const newAlbumsData = await getAlbums({ include_groups: "album" });
      const newSinglesData = await getAlbums({ include_groups: "single" });
      // const newAppearsOnData = await getAlbums({
      //   include_groups: "appears_on",
      // });
      allAlbums = [
        ...allAlbums,
        ...newAlbumsData,
        ...newSinglesData,
        // ...newAppearsOnData,
      ];

      console.log(allAlbums);
    }

    setNewAlbums(allAlbums);
  };

  const handleCreatePlaylist = async () => {
    console.log(newAlbums);

    const createPlaylist = async () => {
      const date = getTodayDate();

      const public_playlist = true;
      console.log(date);

      const playlistResponse = await fetch(
        `https://api.spotify.com/v1/users/${user.id}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + access_token,
          },
          json: true,
          body: JSON.stringify({
            name: date,
            public: public_playlist,
            description: "Created automatically by Spotify-new-music",
          }),
        }
      );
      const playlistData = await playlistResponse.json();

      console.log(playlistData);
      setPlaylist(playlistData);

      const playlistId = playlistData.id;

      const album_ids = newAlbums.map((album) => album.id);

      console.log(album_ids);

      let track_uris = [];

      for (let i = 0; i < album_ids.length; i++) {
        const album_id = album_ids[i];

        const albumTracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album_id}/tracks`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + access_token,
            },
            json: true,
            limit: 50,
          }
        );
        const albumTracksData = await albumTracksResponse.json();
        console.log(albumTracksData);

        track_uris = [
          ...track_uris,
          ...albumTracksData.items.map((track) => track.uri),
        ];
      }

      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        json: true,
        body: JSON.stringify({
          uris: track_uris,
        }),
      });
    };

    createPlaylist();
  };

  return user?.email ? (
    <>
      <p>{user.email}</p>
      <ul>
        {userArtists.map((artist) => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>

      <button onClick={handleShowNewReleases}>Show new Releases</button>
      <button onClick={handleCreatePlaylist}>Create playlist</button>

      <ul>
        {newAlbums.map((album) => (
          <li key={album.id}>
            {album.name} | {album.artists[0].name}
          </li>
        ))}
      </ul>
    </>
  ) : (
    <div>Loading...</div>
  );
};

export default Homepage;
