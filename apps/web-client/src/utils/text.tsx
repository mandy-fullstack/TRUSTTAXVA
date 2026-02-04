import { Text, Platform, StyleSheet } from "react-native";

interface LinkMap {
    [key: string]: {
        label: string;
        onPress: () => void;
    };
}

/**
 * Renders text with inline clickable links defined in a markdown-like syntax:
 * "Check our [Privacy Policy](privacy) and [Terms](terms)."
 * 
 * The link keys ("privacy", "terms") must match the keys in the links object.
 */
export const renderLinkedText = (
    text: string,
    links: LinkMap,
    baseStyle: any = {}
) => {
    // Regex to match [Link Label](link-key)
    const regex = /\[(.*?)]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const label = match[1];
        const key = match[2];
        const linkInfo = links[key];

        if (linkInfo) {
            parts.push(
                <Text
                    key={`link-${match.index}`}
                    style={[styles.link, baseStyle.link]}
                    onPress={linkInfo.onPress}
                    accessibilityRole="link"
                >
                    {label}
                </Text>
            );
        } else {
            // If key not found, just render the label or the whole match
            parts.push(label);
        }

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts;
};

const styles = StyleSheet.create({
    link: {
        color: "#2563EB",
        fontWeight: "600",
        textDecorationLine: "underline",
        // @ts-ignore - web specific
        cursor: Platform.OS === "web" ? "pointer" : "auto",
    },
});
