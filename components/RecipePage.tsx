import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';
import { Recipe, Ingredient, Step } from '../data/recipes';

interface RecipePageProps {
  recipe: Recipe;
  onBack: () => void;
}

export default function RecipePage({ recipe, onBack }: RecipePageProps) {
  useKeepAwake();

  const [servings, setServings] = useState(recipe.baseServings);
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients);
  const [steps, setSteps] = useState<Step[]>(recipe.steps);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const servingsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const toggleIngredient = (id: string) => {
    setIngredients(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleStep = (id: string) => {
    setSteps(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const formatQuantity = (baseQty: number, servings: number): string => {
    const scaled = (baseQty * servings) / recipe.baseServings;
    
    if (scaled >= 100) {
      return Math.round(scaled).toString();
    } else if (scaled >= 10) {
      return (Math.round(scaled * 10) / 10).toString();
    } else {
      return (Math.round(scaled * 100) / 100).toString();
    }
  };

  const getIngredientText = (ingredient: Ingredient): string => {
    if (ingredient.baseQuantity === null) {
      return ingredient.name;
    }
    
    const qty = formatQuantity(ingredient.baseQuantity, servings);
    const unit = ingredient.unit ? ` ${ingredient.unit}` : '';
    return `${qty}${unit} ${ingredient.name}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: recipe.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.summary}>{recipe.summary}</Text>
        </View>

        <View style={styles.servingsContainer}>
          <Text style={styles.servingsLabel}>Raciones</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{servings}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={dropdownOpen} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownOpen(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Raciones</Text>
              {servingsOptions.map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.modalOption, n === servings && styles.modalOptionSelected]}
                  onPress={() => { setServings(n); setDropdownOpen(false); }}
                >
                  <Text style={[styles.modalOptionText, n === servings && styles.modalOptionTextSelected]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {ingredients.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => toggleIngredient(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                {getIngredientText(item)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparación</Text>
          {steps.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => toggleStep(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🍅 ¡Buen provecho! 🍅</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEDD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: {
    fontFamily: 'Karla',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707940',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 12,
    textAlign: 'center',
  },
  summary: {
    fontFamily: 'Karla',
    fontSize: 15,
    color: '#4a5229',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servingsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#707940',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEEDD',
    borderWidth: 2,
    borderColor: '#707940',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  dropdownText: {
    fontFamily: 'Karla',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#707940',
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#707940',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 200,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 12,
  },
  modalOption: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#707940',
  },
  modalOptionText: {
    fontFamily: 'Karla',
    fontSize: 18,
    color: '#424242',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#707940',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#707940',
    borderColor: '#707940',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumber: {
    color: '#707940',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
    fontFamily: 'Karla',
    flex: 1,
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  itemTextChecked: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  footerText: {
    fontFamily: 'Karla',
    fontSize: 20,
    color: '#707940',
  },
});
