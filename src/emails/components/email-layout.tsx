import React from "react";
import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type { ReactNode } from "react";
import { emailTokens } from "@/emails/tokens";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: emailTokens.background,
          fontFamily: emailTokens.fontFamily,
          margin: 0,
          padding: "32px 12px",
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
        }}
      >
        <Container
          style={{
            maxWidth: emailTokens.maxWidth,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}
