import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import {
  widthPercentageToDP  as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// ── Button colour map ─────────────────────────────────
// Any key not listed falls back to the default grey.
const BUTTON_COLORS: Record<string, { bg: string; fg: string }> = {
  "的":  { bg: "#1a3a5c", fg: "#9FA8DA" },  // blue-grey operator
  "=":   { bg: "#E6A817", fg: "#111"    },  // gold equals
  "C":   { bg: "#3a1a1a", fg: "#ff5555" },  // red clear
  "⌫":   { bg: "#2a2a2a", fg: "#aaa"    },  // dark delete
  "1":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "2":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "3":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "4":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "5":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "6":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "7":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "8":   { bg: "#1a2a3a", fg: "#9FA8DA" },
  "9":   { bg: "#1a2a3a", fg: "#9FA8DA" },
};

// ── Layout ─────────────────────────────────────────────
// Each inner array is one row.
// Use objects to allow flex overrides for wide buttons.
type BtnDef = string | { label: string; flex: number };

const BUTTONS: BtnDef[][] = [
  ["弟弟", "妹妹", "哥哥", "姐姐"],
  ["爸爸", "妈妈", "儿子", "女儿"],
  ["姥爷", "姥姥", "爷爷", "奶奶"],
  ["舅舅", "姨",   "叔叔", ""  ],
  ["妻子", "丈夫", " ",   "的"  ],
  ["1",   "2",   "3",   "C"   ],
  ["4",   "5",   "6",   "⌫"   ],
  ["7",   "8",   "9",   "="   ],
];

export default function ButtonGrid({
  onPress,
}: {
  onPress: (v: string) => void;
}) {
  const { width, height } = useWindowDimensions();
  
  const dynamicStyles = useMemo(() => ({
    container: {
      flex: 1,
      paddingBottom: hp("1.5%"),
      backgroundColor: "#000",
    },
    row: {
      flexDirection: "row" as const,
      flex: 1,
    },
    button: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderWidth: wp("0.15%"),
      borderColor: "#222",
      backgroundColor: "#1e1e1e",
    },
    text: {
      fontSize: wp("3.5%"),
      color: "#fff",
      fontWeight: "600" as const,
    },
  }), [width, height]);
  
  return (
    <View style={dynamicStyles.container}>
      {BUTTONS.map((row, i) => (
        <View key={i} style={dynamicStyles.row}>
          {row.map((btn) => {
            const label = typeof btn === "string" ? btn : btn.label;
            const flex  = typeof btn === "object"  ? btn.flex : 1;
            const color = BUTTON_COLORS[label];

            return (
              <TouchableOpacity
                key={label}
                style={[
                  dynamicStyles.button,
                  { flex },
                  color ? { backgroundColor: color.bg } : null,
                ]}
                onPress={() => onPress(label)}
                activeOpacity={0.65}
              >
                <Text
                  style={[
                    dynamicStyles.text,
                    color ? { color: color.fg } : null,
                  ]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.7}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}