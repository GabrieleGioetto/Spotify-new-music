import { getTodayDate } from "../utils/dates";
import { getOnlyExplicitVersion, getUniqueListBy } from "../utils/functions";

export const handleCreatePlaylist = async ({
  user_id,
  access_token,
  selectedAlbums,
  setLoading,
  setVisible,
}) => {
  setLoading(true);
  const date = getTodayDate();
  const public_playlist = true;

  const playlistResponse = await fetch(
    `https://api.spotify.com/v1/users/${user_id}/playlists`,
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
  const playlistId = playlistData.id;

  const album_ids = selectedAlbums;

  let track_uris = [];
  let promises = [];

  for (let i = 0; i < album_ids.length; i++) {
    const album_id = album_ids[i];

    promises.push(
      fetch(`https://api.spotify.com/v1/albums/${album_id}/tracks`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        json: true,
        limit: 50,
      })
    );
  }

  const responses = await Promise.all(promises);
  const albumTracksDatas = await Promise.all(responses.map((r) => r.json()));

  albumTracksDatas = albumTracksDatas.flatMap((album) => album.items);

  albumTracksDatas = getOnlyExplicitVersion(albumTracksDatas);

  console.log(albumTracksDatas);

  track_uris = albumTracksDatas.map((track) => track.uri);

  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + access_token,
    },
    json: true,
    body: JSON.stringify({
      uris: track_uris,
    }),
  });

  setLoading(false);
  setVisible(false);
};

export const handleShowNewReleases = async ({
  selectedArtists,
  access_token,
  setNewAlbums,
  setVisible,
  setLoading,
}) => {
  setLoading(true);
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
  setLoading(false);
};

export const fetchUser = async ({ access_token, setUser }) => {
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

export const fetchUserArtists = async ({
  access_token,
  setUserArtists,
  setSelectedArtists,
}) => {
  // Spotify API only returns 50 artists maximum at a time
  let notFinished = true;

  let allUserArtistsData = [];
  let link = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

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

  allUserArtistsData = allUserArtistsData.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  setUserArtists(allUserArtistsData);
  setSelectedArtists(allUserArtistsData.map((artist) => artist.id));
};
