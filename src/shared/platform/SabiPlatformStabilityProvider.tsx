import React, { type ReactNode, useEffect } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
};

type ComponentWithDefaultProps = {
  defaultProps?: Record<string, unknown>;
};

let installed = false;

function installTextDefaults() {
  if (installed) return;
  installed = true;

  const textComponent = Text as unknown as ComponentWithDefaultProps;
  textComponent.defaultProps = {
    ...(textComponent.defaultProps ?? {}),
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  const inputComponent = TextInput as unknown as ComponentWithDefaultProps;
  inputComponent.defaultProps = {
    ...(inputComponent.defaultProps ?? {}),
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
    underlineColorAndroid: "transparent",
  };
}

function installNativeViewportDefaults() {
  if (Platform.OS === "web") return;

  if (Platform.OS === "android") {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
  }

  StatusBar.setBarStyle("light-content");
}

function installWebViewportDefaults() {
  if (Platform.OS !== "web") return;
  if (typeof document === "undefined") return;

  const elementId = "sabi-platform-stability-style";
  const existing = document.getElementById(elementId);
  if (existing) return;

  const style = document.createElement("style");
  style.id = elementId;
  style.textContent = `
    html, body, #root {
      width: 100%;
      height: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      background: #020A12;
      overflow: hidden;
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
      text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    #root {
      display: flex;
      flex-direction: column;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    input, textarea, select, button {
      font: inherit;
    }

    img, video, canvas, svg {
      max-width: 100%;
    }
  `;
  document.head.appendChild(style);
}

export default function SabiPlatformStabilityProvider({ children }: Props) {
  installTextDefaults();

  useEffect(() => {
    installNativeViewportDefaults();
    installWebViewportDefaults();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.root}>{children}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "transparent",
  },
});
