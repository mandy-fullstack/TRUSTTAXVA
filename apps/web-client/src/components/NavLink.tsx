/**
 * NavLink: Safe navigation component for react-native-web.
 *
 * We avoid `react-router-dom`'s `<Link>` inside React Native `<View>` trees,
 * because it can produce raw DOM text nodes and trigger:
 * "Unexpected text node: . A text node cannot be a child of a <View>."
 */

import type { ReactNode } from "react";
import { TouchableOpacity, Platform } from "react-native";
import { useNavigate, type To } from "react-router-dom";

export function NavLink({
  to,
  replace,
  state,
  children,
  style,
  onPress,
}: {
  to: To;
  replace?: boolean;
  state?: any;
  children: ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <TouchableOpacity
      onPress={() => {
        onPress?.();
        navigate(to, { replace, state });
      }}
      activeOpacity={0.85}
      style={style}
      {...(Platform.OS === "web" ? ({ role: "link" } as any) : {})}
    >
      {children}
    </TouchableOpacity>
  );
}
