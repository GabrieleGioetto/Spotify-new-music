import { useState, useEffect } from "react";
import { Text, Checkbox, Button, Modal, Loading } from "@nextui-org/react";
import { getTodayDate } from "../utils/dates";
import { getOnlyExplicitVersion } from "../utils/functions";

const ModalNewReleases = ({
  visible,
  setVisible,
  access_token,
  newAlbums,
  user_id,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState([]);

  useEffect(() => {
    // Default: all albums selected
    setSelectedAlbums(newAlbums.map((album) => album.id));
  }, [visible]);

  const closeHandlerModal = () => {
    setVisible(false);
  };

  const handleCreatePlaylist = async () => {
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
    console.log(selectedAlbums);
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

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={closeHandlerModal}
      scroll
    >
      <Modal.Header>
        <Text b id="modal-title" size={18}>
          Choose the new releases you want in your playlist
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Checkbox.Group
          color="success"
          value={selectedAlbums}
          onChange={setSelectedAlbums}
        >
          {newAlbums.map((album) => (
            <Checkbox key={album.id} color="primary" value={album.id} size="sm">
              {album.artists[0].name} | {album.name} ({album.album_type})
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onClick={closeHandlerModal}>
          Close
        </Button>
        <Button disabled={loading} auto onClick={handleCreatePlaylist}>
          {loading ? <Loading color="white" size="sm" /> : `Create Playlist`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNewReleases;
