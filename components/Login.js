import { Container, Row, Text } from "@nextui-org/react";
import NextLink from "next/link";
import { Button, css } from "@nextui-org/react";
import { getOnlyExplicitVersion } from "../utils/functions";

const Login = (context) => {
  console.log(context);
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

export async function getServerSideProps(context) {
  return {
    props: { message: `Next.js is awesome` }, // will be passed to the page component as props
  };
}

export default Login;
