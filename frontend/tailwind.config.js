/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",        // near-black background panels
        manuscript: "#F6F5F1", // paper background
        redline: "#C81E3A",    // editor's red pen
        slate: "#3B4B66",      // secondary accent / links
        gold: "#B8892B",       // score highlight
        line: "#DAD7CE",       // hairline rule on paper
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "paper-texture":
          "radial-gradient(circle at 1px 1px, rgba(20,21,26,0.035) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}
