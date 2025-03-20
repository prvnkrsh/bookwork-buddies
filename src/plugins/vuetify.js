import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.min.css";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#42A5F5",
          secondary: "#FFCA28",
          accent: "#FF5252",
          error: "#FF5252", // Ensure error color is set
          background: "#121212",
          surface: "#1E1E1E",
          onSurface: "#FFFFFF",
          onBackground: "#FFFFFF",
        },
      },
    },
  },
});
