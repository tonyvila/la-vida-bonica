import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image } from 'react-native';
import { useState } from 'react';
import HomePage from './components/HomePage';
import RecipePage from './components/RecipePage';
import { recipes } from './data/recipes';

export default function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.navbar}>
        <Image
          source={{ uri: 'https://lavidabonica.com/wp-content/uploads/2024/02/logo-small.png' }}
          style={styles.navLogo}
          resizeMode="contain"
        />
      </View>

      {selectedRecipe ? (
        <RecipePage
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipeId(null)}
        />
      ) : (
        <HomePage
          recipes={recipes}
          onRecipeSelect={setSelectedRecipeId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEDD',
  },
  navbar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  navLogo: {
    width: 150,
    height: 40,
  },
});
