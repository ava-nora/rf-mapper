# RF Link Planner

A modern, interactive web application for planning and visualizing point-to-point RF (Radio Frequency) links with comprehensive Fresnel zone analysis. Built with Next.js and featuring real-time terrain elevation data integration.

## 🎯 Features

### Core Functionality
- **Interactive Map Interface**: Click-to-place towers on an interactive map powered by Leaflet and OpenStreetMap
- **Tower Management**: 
  - Add towers by clicking on the map
  - Edit tower frequencies (double-click to edit inline)
  - Delete towers with confirmation
  - Visual indicators for selected and connecting towers
- **Link Creation**: 
  - Connect towers with matching frequencies
  - Visual link representation with distance calculations
  - Frequency validation to ensure compatible connections
- **Fresnel Zone Analysis**:
  - Real-time Fresnel zone calculation and visualization
  - Elevation profile fetching using Open-Elevation API
  - Obstruction detection and clearance analysis
  - Interactive elevation charts with terrain visualization
- **Responsive Design**: 
  - Mobile-friendly interface with collapsible control panel
  - Optimized for both desktop and mobile devices
  - Touch-friendly interactions

### User Experience
- **Toast Notifications**: Real-time feedback for user actions
- **Visual Feedback**: Color-coded towers and links based on state
- **Elevation Charts**: Detailed elevation profiles with Fresnel zone visualization
- **Quick Guide**: Built-in help section for easy onboarding

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Chart library for elevation visualization

### Mapping & Visualization
- **Leaflet** - Interactive map library
- **OpenStreetMap** - Map tile provider
- **Open-Elevation API** - Terrain elevation data

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Geist Font** - Optimized font loading

## 📦 Project Structure

```
rf-mapper/
├── app/
│   ├── components/
│   │   ├── ControlPanel.tsx      # Side panel with tower/link management
│   │   ├── MapContainer.tsx      # Main map component with Leaflet integration
│   │   ├── ElevationChart.tsx    # Elevation profile visualization
│   │   └── Toast.tsx             # Toast notification system
│   ├── ui/                       # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── ScrollArea.tsx
│   │   └── Separator.tsx
│   ├── utils/
│   │   ├── calculations.ts      # RF calculations (Fresnel zone, distance, bearing)
│   │   └── elevation.ts         # Elevation API integration
│   ├── types.ts                  # TypeScript type definitions
│   ├── page.tsx                  # Main application page
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles and animations
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd rf-mapper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Adding Towers
1. Click anywhere on the map to place a tower
2. The tower will appear with a default frequency of 5.0 GHz
3. Double-click the frequency in the tower card to edit it inline
4. Or select the tower and edit the frequency in the expanded panel

### Creating Links
1. Select a tower from the control panel
2. Click the "Connect" button
3. Click another tower on the map with a matching frequency
4. A link will be created between the two towers

### Analyzing Fresnel Zones
1. Click on any link (the line connecting two towers)
2. The Fresnel zone will be visualized on the map as a green ellipse
3. View the elevation profile chart showing:
   - Terrain elevation
   - Line of sight
   - Fresnel zone boundaries
   - Obstruction warnings (if any)

### Mobile Usage
- Tap the menu button (☰) in the top-right corner to open the control panel
- All features are accessible on mobile devices
- Tap towers and links to interact with them

## 🔬 Technical Details

### RF Calculations
The application performs several RF engineering calculations:

- **Fresnel Zone Radius**: Calculated using the formula `r = √((λ × d1 × d2) / (d1 + d2))`
- **Distance Calculation**: Uses the Haversine formula for accurate geographic distances
- **Bearing Calculation**: Determines the angle between two points for proper ellipse rotation
- **Clearance Analysis**: Compares terrain elevation with Fresnel zone requirements

### Elevation Data
- Uses the Open-Elevation API for terrain data
- Fetches elevation profiles along the link path
- Falls back to mock data if the API is unavailable

### Map Integration
- Leaflet library loaded dynamically
- OpenStreetMap tiles for map rendering
- Custom markers and polylines for towers and links
- Interactive tooltips and click handlers

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom animations and utilities defined in `app/globals.css`. You can customize:
- Color schemes
- Animation timings
- Component styles
- Responsive breakpoints

### Default Values
- Default tower frequency: 5.0 GHz
- Elevation API points: 10 points per link
- Map center: United States (39.8283°N, 98.5795°W)
- Initial zoom level: 5

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Dependencies

### External APIs Used
- **Open-Elevation API**: `https://api.open-elevation.com/api/v1/lookup`
  - Free tier with rate limits
  - Used for fetching terrain elevation data
  - Falls back gracefully if unavailable

### Map Services
- **OpenStreetMap**: Tile service for map rendering
- **Leaflet CDN**: Map library loaded from unpkg.com

## 🐛 Known Limitations

- Elevation API has rate limits (free tier)
- Elevation data accuracy depends on API availability
- Fresnel zone calculations assume standard atmospheric conditions
- Mobile performance may vary with complex link configurations

## 🔮 Future Enhancements

Potential features for future development:
- Save/load link configurations
- Export reports (PDF/CSV)
- Multiple frequency band support
- Advanced RF calculations (path loss, link budget)
- Custom tower heights and antenna parameters
- Weather overlay integration
- Collaborative editing

## 📄 License

This project is private and not licensed for public use.

## 👨‍💻 Development

Built with modern web technologies focusing on:
- Type safety with TypeScript
- Component reusability
- Responsive design principles
- Performance optimization
- User experience best practices

---

**Note**: This application is designed for RF planning and visualization purposes. For production RF link deployments, always consult with RF engineering professionals and perform comprehensive site surveys.

By - AVANORA(Avanendra Pratap Singh)