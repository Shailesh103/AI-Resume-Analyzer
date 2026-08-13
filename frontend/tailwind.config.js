/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171522",         // deep ink-indigo, warmer than pure black
        manuscript: "#FBF6ED",  // warm ivory paper (distinct from plain white)
        redline: "#D8264A",     // editor's red pen — brighter, more alive
        forest: "#1D8348",      // strong/positive score — green reads as "good"
        gold: "#D6963A",        // mid-tier score — warmer, brighter amber
        slate: "#4C4FA8",       // secondary UI — rich indigo instead of gray-blue
        line: "#E5DCC8",        // warm hairline rule on paper
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "paper-texture":
          "radial-gradient(circle at 1px 1px, rgba(23,21,34,0.045) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}
