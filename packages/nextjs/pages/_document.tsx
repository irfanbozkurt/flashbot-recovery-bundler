import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <div id="myportal" />
          <div id="myportal2" />
          <NextScript />
        </body>
      </Html>
    );
  }
}
