import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import { PropsWithChildren } from "react";
import { MainLayout } from "~/components/MainLayout";
import { Providers } from "~/components/Providers";

export const metadata: Metadata = {
  title: "Home Manager",
  description: "Hans Yulian's Home Manager",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
