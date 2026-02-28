import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';

interface Ingredient {
  id: string;
  baseQuantity: number | null; // null for items without numeric quantity
  unit: string;
  name: string;
  checked: boolean;
}

interface Step {
  id: string;
  text: string;
  checked: boolean;
}

const BASE_SERVINGS = 4;

export default function App() {
  useKeepAwake();

  const [servings, setServings] = useState(BASE_SERVINGS);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', baseQuantity: 1, unit: 'kg de', name: 'tomates maduros', checked: false },
    { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente', checked: false },
    { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias', checked: false },
    { id: '4', baseQuantity: 50, unit: 'gr de', name: 'AOVE', checked: false },
    { id: '5', baseQuantity: null, unit: '', name: 'Sal y vinagre de Jérez', checked: false },
    { id: '6', baseQuantity: 2, unit: '', name: 'huevos', checked: false },
    { id: '7', baseQuantity: null, unit: '', name: 'Jamón serrano sin aditivos', checked: false },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { 
      id: '1', 
      text: 'Echar en el vaso los tomates sin pelar y las zanahorias peladas, todo bien lavado y en trozos homogéneos. Añadir el diente de ajo y programar 30 segundos en Vel 5.', 
      checked: false 
    },
    { 
      id: '2', 
      text: 'Bajar la verdura de las paredes del vaso, añadir 25 gr de vinagre de Jérez y una cucharadita de sal y programar 4 minutos en Vel máxima.', 
      checked: false 
    },
    { 
      id: '3', 
      text: 'Una vez pasados los 4 minutos volver a programar en Vel 5 y por el brocal ir añadiendo AOVE (4 cucharadas aprox).', 
      checked: false 
    },
    { 
      id: '4', 
      text: 'Acompañar de huevo cocido y jamón picado. Si se prepara antes, envasar en recipiente hermético y a la nevera.', 
      checked: false 
    },
  ]);

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

  const handleServingsChange = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setServings(value);
    } else if (text === '') {
      setServings(1);
    }
  };

  const formatQuantity = (baseQty: number, servings: number): string => {
    const scaled = (baseQty * servings) / BASE_SERVINGS;
    
    // Round to reasonable precision
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
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Salmorejo sin pan</Text>
          <Text style={styles.summary}>
            El salmorejo es un plato típico andaluz, una versión más espesa que el gazpacho. 
            Esta receta lo hace sin pan y con menos aceite, más ligero pero igual de sabrosón.
          </Text>
        </View>

        <View style={styles.servingsContainer}>
          <Text style={styles.servingsLabel}>Raciones:</Text>
          <TextInput
            style={styles.servingsInput}
            value={servings.toString()}
            onChangeText={handleServingsChange}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>

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
    backgroundColor: '#FFF5E6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D84315',
    marginBottom: 12,
    textAlign: 'center',
  },
  summary: {
    fontSize: 15,
    color: '#6D4C41',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    color: '#D84315',
    marginRight: 12,
  },
  servingsInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D84315',
    backgroundColor: '#FFF5E6',
    borderWidth: 2,
    borderColor: '#FF6F3C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
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
    color: '#E64A19',
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
    borderColor: '#FF6F3C',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#FF6F3C',
    borderColor: '#FF6F3C',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumber: {
    color: '#FF6F3C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
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
  },
  footerText: {
    fontSize: 20,
    color: '#D84315',
  },
});
