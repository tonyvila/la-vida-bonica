# La Vida Bonica 🍅

A beautiful recipe app built with React Native and Expo.

## Features

- ✅ Interactive recipe with checkable ingredients and steps
- 📱 Clean, modern UI with warm, food-app colors
- 🔆 Screen stays awake while viewing recipes
- 📝 TypeScript for type safety

## Recipe

Currently featuring: **Salmorejo sin pan** - Traditional Andalusian cold soup

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Tech Stack

- React Native
- Expo (managed workflow)
- TypeScript
- expo-keep-awake

## Project Structure

```
la-vida-bonica/
├── App.tsx          # Main app component with recipe UI
├── app.json         # Expo configuration
├── package.json     # Dependencies
└── assets/          # Images and icons
```

## Development

The app uses:
- **Expo Keep Awake** to prevent screen timeout while cooking
- **React Hooks** for state management (ingredients/steps checkboxes)
- **ScrollView** for smooth scrolling through long recipes

## Color Scheme

- Primary: `#D84315` (Warm red-orange)
- Secondary: `#FF6F3C` (Bright orange)
- Background: `#FFF5E6` (Warm cream)
- Cards: `#FFFFFF` (White)

## Future Enhancements

- [ ] Multiple recipes
- [ ] Recipe search
- [ ] Recipe categories
- [ ] Shopping list generation
- [ ] Recipe sharing
- [ ] Favorites

---

Made with ❤️ and 🍅
