# DD Team Builder

A team composition planner for **Darkest Dungeon 1**. Build and save your party compositions with heroes, skills, trinkets, and quirks.

![Darkest Dungeon](https://img.shields.io/badge/Darkest%20Dungeon-1-8B0000?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🎭 **Hero Selection** - All 18 base game heroes + modded heroes support
- ⚔️ **Skill Configuration** - Select up to 4 combat skills and 4 camping skills per hero
- 💎 **Trinket System** - Equip 2 trinkets per hero from the full trinket database
- 🎲 **Quirk Management** - Add positive and negative quirks with locking support
- 🔄 **Drag & Drop** - Reorder heroes in your party composition
- 💾 **Auto-Save** - The party you are building survives a reload; named teams are saved to localStorage on demand
- 📊 **Hero Stats** - HP, dodge, prot, speed, crit and damage, with what your trinkets and quirks do to them
- 🔗 **Share Links** - Copy a link that carries the whole party; opening it loads the comp
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Darkest Dungeon Theme** - Gothic styling with the DwarvenAxe font

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bluefireF5ran/dd-team-builder.git
cd dd-team-builder

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI components
│   ├── hero/            # Hero selection and configuration
│   ├── party/           # Party composition display
│   ├── quirks/          # Quirk management
│   └── team/            # Team controls and header
├── config/
│   └── assets.js        # Asset URL configuration
├── constants/           # App constants
├── data/                # Hero, trinket, quirk data
├── hooks/               # Custom React hooks
└── utils/               # Helper functions

tools/
└── data-migration/      # One-shot scripts that built src/data/ — not part of the build
```

The scripts under `tools/data-migration/` extracted and reconciled the hero, skill and trinket
data from the game files and from Steam Workshop mods. They are kept for provenance; nothing in
`src/` imports them. See [their README](tools/data-migration/README.md).

## 🖼️ Assets Repository

Images are served from a separate repository to keep this codebase lightweight:

**Assets Repository:** [dd-team-builder-assets](https://github.com/bluefireF5ran/dd-team-builder-assets)

### Asset Configuration

The asset loading is configured in `src/config/assets.js`:

```javascript
// Toggle between local and external assets
const USE_EXTERNAL_ASSETS = true;

// External assets URL (GitHub raw)
const GITHUB_ASSETS = 'https://raw.githubusercontent.com/bluefireF5ran/dd-team-builder-assets/main';
```

### Local Development with Assets

If you want to develop with local assets:

1. Clone the assets repository:
   ```bash
   git clone https://github.com/bluefireF5ran/dd-team-builder-assets.git
   ```

2. Copy the `images` folder to `public/`:
   ```bash
   cp -r dd-team-builder-assets/images public/
   ```

3. Set `USE_EXTERNAL_ASSETS = false` in `src/config/assets.js`

### Adding New Assets

1. Add images to the [assets repository](https://github.com/bluefireF5ran/dd-team-builder-assets)
2. Follow the naming convention: `lowercase_with_underscores.png`
3. Place in the appropriate folder:
   - `images/heroes/` - Hero portraits
   - `images/skills/` - Combat skill icons
   - `images/camp_skills/` - Camping skill icons
   - `images/trinkets/` - Trinket icons
   - `images/quirks/` - Quirk icons
   - `images/modded/` - Modded content (with workshop ID prefix)

## 🎮 Adding Modded Heroes

Modded heroes are defined in `src/data/modded_heroes.js`. Each hero needs:

- Workshop ID (from Steam Workshop URL)
- Hero class definition with skills, trinkets, and camping skills
- Images in the assets repo under `images/modded/`

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Tailwind CSS 3** - Styling
- **html2canvas** - PNG export
- **localStorage** - Data persistence

## 📝 License

This project is for personal/fan use. Darkest Dungeon is a trademark of Red Hook Studios.

## 🙏 Acknowledgments

- [Red Hook Studios](https://www.darkestdungeon.com/) for creating Darkest Dungeon
- The DD modding community for workshop content
- DwarvenAxe font for the gothic typography
