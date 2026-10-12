import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Pig Project Revolving Fund",
  description: "Management platform for Value Protocols, Rwanda",
  icons: {
    icon: [
      { url: "/pig-project-rwanda-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/pig-project-rwanda-logo.svg",
    apple: "/pig-project-rwanda-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem("pp_pref_theme") || "light";
                var size = localStorage.getItem("pp_pref_text_size") || "default";
                document.documentElement.setAttribute("data-theme", theme);
                document.documentElement.setAttribute("data-text-size", size);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
