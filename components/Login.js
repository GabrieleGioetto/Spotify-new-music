import { Container, Row, Text } from "@nextui-org/react";

const Login = () => {
  console.log("woo");
  return (
    <Container>
      <Row justify="center" align="center">
        <Text h6 size={15} css={{ m: 0 }}>
          NextUI gives you the best developer experience with all the features
          you need for building beautiful and modern websites and applications.
        </Text>
      </Row>
    </Container>
  );
};

export default Login;
