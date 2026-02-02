import { View, StyleSheet } from "react-native";
import {
  FileText,
  Image as ImageIcon,
  File,
  FileSpreadsheet,
  Video,
  FileArchive,
} from "lucide-react";

interface FileIconProps {
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export const FileIcon = ({
  fileName = "",
  mimeType = "",
  size = 24,
}: FileIconProps) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const type = mimeType.toLowerCase();

  // Icon & Color Logic
  let Icon = File;
  let color = "#64748B"; // Slate 500
  let bg = "#F1F5F9"; // Slate 100

  if (type.includes("pdf") || ext === "pdf") {
    Icon = FileText;
    color = "#EF4444"; // Red 500
    bg = "#FEF2F2"; // Red 50
  } else if (type.includes("word") || ["doc", "docx"].includes(ext)) {
    Icon = FileText;
    color = "#2563EB"; // Blue 600
    bg = "#EFF6FF"; // Blue 50
  } else if (
    type.includes("sheet") ||
    type.includes("excel") ||
    ["xls", "xlsx", "csv"].includes(ext)
  ) {
    Icon = FileSpreadsheet;
    color = "#10B981"; // Emerald 500
    bg = "#ECFDF5"; // Emerald 50
  } else if (
    type.includes("image") ||
    ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)
  ) {
    Icon = ImageIcon;
    color = "#8B5CF6"; // Violet 500
    bg = "#F5F3FF"; // Violet 50
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    Icon = FileArchive;
    color = "#F59E0B"; // Amber 500
    bg = "#FFFBEB"; // Amber 50
  } else if (type.includes("video") || ["mp4", "mov", "avi"].includes(ext)) {
    Icon = Video;
    color = "#EC4899"; // Pink 500
    bg = "#FDF2F8"; // Pink 50
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          width: size * 2,
          height: size * 2,
          borderRadius: 0,
        },
      ]}
    >
      <Icon size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
