import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userArtists, setUserArtists] = useState([]);

  const [newAlbums, setNewAlbums] = useState([]);

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

  const handleCreatePlaylist = async () => {
    const artistId = "0MTX6zc6t4ijdHIy1TaLjt";
    const newAlbumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50`,
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

    setNewAlbums(newAlbumsData);
  };

  return user?.email ? (
    <>
      <p>{user.email}</p>
      <ul>
        {userArtists.map((artist) => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>

      <button onClick={handleCreatePlaylist}>Create playlist</button>
      <ul>
        {newAlbums.map((song) => (
          <li key={song.id}>{song.name}</li>
        ))}
      </ul>
    </>
  ) : (
    <div>Loading...</div>
  );
};

export default Homepage;
