/**
 * NavLink: Wrapper around react-router-dom Link that's compatible with react-native-web.
 * Ensures proper rendering and avoids React version conflicts.
 */

import { Link as RouterLink, type LinkProps } from "react-router-dom";
import { Platform } from "react-native";

export function NavLink({ style, ...props }: LinkProps & { style?: any }) {
  const webStyle =
    Platform.OS === "web"
      ? { textDecoration: "none", ...(style || {}) }
      : style;

  return <RouterLink {...props} style={webStyle} />;
}
