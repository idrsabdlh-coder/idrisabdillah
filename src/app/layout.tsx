import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";
export const metadata: Metadata = {
  title: "Idris Abdillah - homepage",
  description: "Homepage",
};

// Jalan sebelum paint: tentukan tema (gelap/terang) dan status opening
const initScript = `
try{var d=document.documentElement,t=localStorage.getItem('portfolio-theme-mode');
if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}
d.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}
try{
  var p=window.location.pathname;
  if(p&&p!=='/'){document.documentElement.dataset.opening='done'}
  else{document.documentElement.dataset.opening=sessionStorage.getItem('opening-seen')==='1'?'done':'running'}
}catch(e){document.documentElement.dataset.opening='done'}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <Script
          id="init-theme-opening"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: initScript }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}