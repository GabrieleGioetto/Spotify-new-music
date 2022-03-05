import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Loading,
  Text,
  Container,
  Checkbox,
  Button,
  Row,
  Input,
} from "@nextui-org/react";
import ModalNewReleases from "../components/ModalNewReleases";
import {
  handleShowNewReleases,
  fetchUser,
  fetchUserArtists,
} from "../utils/api_calls";
import { getLastWeekDate } from "../utils/functions";

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userArtists, setUserArtists] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(getLastWeekDate());

  // Modal handler
  const [visible, setVisible] = useState(false);

  const { access_token, refresh_token } = router.query;

  useEffect(() => {
    if (access_token) {
      fetchUser({ access_token, setUser });
      fetchUserArtists({
        access_token,
        setUserArtists,
        setSelectedArtists,
      });
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

      <Row>
        <Input
          initialValue={startDate}
          width="200px"
          label="Start date"
          type="date"
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
      </Row>

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
            key={artist.id}
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
            startDate,
          })
        }
        disabled={loading}
        rounded
        color="gradient"
        size="lg"
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
