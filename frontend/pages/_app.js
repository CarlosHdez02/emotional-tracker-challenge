import { createGlobalStyle, ThemeProvider } from "styled-components";
import { AuthProvider } from "../context/AuthContext";
import { EmotionProvider } from "../context/EmotionContext";
import { ReminderProvider } from "../context/ReminderContext";
import { DataSharingProvider } from "../context/DataSharingContext";
import {
  IdentifyContext,
  IdentifyPatternProvider,
} from "../context/IdentifyContext";
import ErrorBoundary from "../ErrorBoundary";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');

  html,
  body {
    padding: 0;
    margin: 0;
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    background-color: #f5f6fa;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
`;

const theme = {
  colors: {
    primary: "#3CABDB",
    secondary: "#2ecc71",
    danger: "#e74c3c",
    warning: "#f39c12",
    dark: "#2c3e50",
    light: "#ecf0f1",
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <AuthProvider>
            <EmotionProvider>
              <IdentifyPatternProvider>
                <DataSharingProvider>
                  <ReminderProvider>
                    <Component {...pageProps} />
                  </ReminderProvider>
                </DataSharingProvider>
              </IdentifyPatternProvider>
            </EmotionProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
