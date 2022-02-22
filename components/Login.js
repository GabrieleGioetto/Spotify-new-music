import { Container, Row, Text } from "@nextui-org/react";
import Link from "next/link";

const Login = (context) => {
  console.log(context);
  return (
    <Container>
      <Row justify="center" align="center">
        <Link href="/api/login">Login with Spotify</Link>
      </Row>
    </Container>
  );
};

export async function getServerSideProps(context) {
  return {
    props: { message: `Next.js is awesome` }, // will be passed to the page component as props
  };
}

export default Login;
