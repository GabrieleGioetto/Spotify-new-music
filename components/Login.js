import { Container } from "@nextui-org/react";
import NextLink from "next/link";
import { Button } from "@nextui-org/react";

const Login = () => {
  return (
    <Container
      css={{ height: "90vh" }}
      alignItems="center"
      justify="center"
      display="flex"
      direction="row"
      fluid={true}
    >
      <NextLink href="/api/login" passHref>
        <Button shadow color="gradient" auto>
          Login on Spotify
        </Button>
      </NextLink>
    </Container>
  );
};

export default Login;
