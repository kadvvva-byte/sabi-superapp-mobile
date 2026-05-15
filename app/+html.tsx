import type { ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

type Props = {
  children: ReactNode;
};

export default function Html({ children }: Props) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <meta name="theme-color" content="#020A12" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                width: 100%;
                height: 100%;
                min-height: 100%;
                margin: 0;
                padding: 0;
                background: #020A12;
                overflow: hidden;
                overscroll-behavior: none;
                -webkit-overflow-scrolling: touch;
                text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
              }

              #root {
                display: flex;
                flex-direction: column;
              }

              *, *::before, *::after {
                box-sizing: border-box;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
