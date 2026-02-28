import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Recipe } from '../data/recipes';

interface HomePageProps {
  recipes: Recipe[];
  onRecipeSelect: (recipeId: string) => void;
}

export default function HomePage({ recipes, onRecipeSelect }: HomePageProps) {
  // Sort recipes alphabetically by title
  const sortedRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Recetas</Text>
        <Text style={styles.subtitle}>Selecciona una receta para empezar</Text>
      </View>

      <View style={styles.recipeGrid}>
        {sortedRecipes.map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => onRecipeSelect(recipe.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: recipe.thumbnail }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEDD',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#4a5229',
    textAlign: 'center',
  },
  recipeGrid: {
    paddingHorizontal: 20,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 180,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    textAlign: 'center',
  },
});
