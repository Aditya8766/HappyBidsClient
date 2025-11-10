import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from "@apollo/client";
import fetch from "cross-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GRAPHQL_URL as ENV_GRAPHQL_URL } from '@env';

const GRAPHQL_URL = ENV_GRAPHQL_URL;
const httpLink = new HttpLink({ uri: GRAPHQL_URL, fetch });

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    AsyncStorage.getItem("idToken")
      .then((token) => {
        if (token) {
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              Authorization: `Bearer ${token}`,
            },
          }));
        }
      })
      .finally(() => {
        const subscriber = forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });

        return () => subscriber.unsubscribe();
      });
  });
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
