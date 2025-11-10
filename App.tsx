import React from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./src/graphql/client";
import AppNavigator from "./src/AppNavigator";

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppNavigator />
    </ApolloProvider>
  );
}
