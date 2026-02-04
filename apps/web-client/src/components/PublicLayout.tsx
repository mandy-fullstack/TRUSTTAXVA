import { useRef, useEffect, type ReactNode } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  type DimensionValue,
  Platform,
} from "react-native";
import { useLocation } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { profile } = useCompany();
  const theme = profile?.themeOptions || {};
  const { pathname } = useLocation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);

  return (
    <>
      {/* Skip to main content link - rendered outside View for web compatibility */}
      {Platform.OS === "web" && (
        <a
          href="#main-content"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const mainContent = document.getElementById("main-content");
            if (mainContent) {
              (mainContent as HTMLElement).focus();
              mainContent.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
        >
          Skip to main content
        </a>
      )}
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background || "#FFF" },
        ]}
      >
        <Header />

        <ScrollView
          ref={scrollRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            id="main-content"
            style={styles.mainContent}
            tabIndex={-1}
            {...(Platform.OS === "web"
              ? {
                // @ts-ignore - web-specific props
                onFocus: (e: any) => (e.target.style.outline = "none"),
              }
              : {})}
          >
            {children}
          </View>
          <Footer />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: "100vh" as DimensionValue,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  mainContent: {
    width: "100%" as DimensionValue,
    minWidth: "100%" as DimensionValue,
  },
});
