import { useState, useEffect } from "react";
import { Text, Checkbox, Button, Modal, Loading } from "@nextui-org/react";
import { handleCreatePlaylist } from "../utils/api_calls";

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
        <Button
          disabled={loading}
          auto
          onClick={() =>
            handleCreatePlaylist({
              user_id,
              access_token,
              selectedAlbums,
              setLoading,
              setVisible,
            })
          }
        >
          {loading ? <Loading color="white" size="sm" /> : `Create Playlist`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNewReleases;
