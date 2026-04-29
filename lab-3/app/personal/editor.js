import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"

// Icons
import { Ionicons } from "@expo/vector-icons"

// Database helpers
import {
  insertRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
  generateCustomId,
} from "../../db"

// Utils
import { pickImage } from "../../utils/imagePicker"

// Constants
const EMPTY_INGREDIENT = { name: "", measure: "" }

export default function RecipeEditorScreen() {
  const router = useRouter()
  const { idMeal } = useLocalSearchParams()
  const isEditMode = !!idMeal

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [area, setArea] = useState("")
  const [thumb, setThumb] = useState("")
  const [instructions, setInstructions] = useState("")
  const [ingredients, setIngredients] = useState([{ ...EMPTY_INGREDIENT }])
  const [showImageError, setShowImageError] = useState(false)

  useEffect(() => {
    if (!isEditMode) return

    const existing = getRecipeById(idMeal)
    if (!existing) {
      Alert.alert("Recipe not found")
      router.back()
      return
    }

    setName(existing.strMeal ?? "")
    setCategory(existing.strCategory ?? "")
    setArea(existing.strArea ?? "")
    setThumb(existing.strMealThumb ?? "")
    setInstructions(existing.strInstructions ?? "")
    setIngredients(
      existing.ingredients?.length
        ? existing.ingredients
        : [{ ...EMPTY_INGREDIENT }]
    )
  }, [idMeal, isEditMode])

  const handlePickImage = async () => {
    const uri = await pickImage()
    if (uri) {
      setThumb(uri)
      setShowImageError(false)
    }
  }

  const updateIngredient = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    )
  }

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }])
  }

  const removeIngredient = (index) => {
    setIngredients((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    )
  }

  const handleSave = () => {
    if (!thumb) {
      setShowImageError(true)
      return
    }
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a recipe name.")
      return
    }

    const cleanedIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), measure: i.measure.trim() }))
      .filter((i) => i.name.length > 0)

    const payload = {
      strMeal: name.trim(),
      strCategory: category.trim() || null,
      strArea: area.trim() || null,
      strMealThumb: thumb,
      strInstructions: instructions.trim() || null,
      ingredients: cleanedIngredients,
    }

    if (isEditMode) {
      updateRecipe(idMeal, payload)
    } else {
      insertRecipe({
        ...payload,
        idMeal: generateCustomId(),
        isCustom: true,
      })
    }

    router.back()
  }

  const handleDelete = () => {
    Alert.alert("Delete recipe?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteRecipe(idMeal)
          router.dismissTo("/personal")
        },
      },
    ])
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isEditMode ? "Edit Recipe" : "New Recipe",
          headerRight: () => (
            <Pressable onPress={handleSave} hitSlop={10}>
              <Text style={styles.headerSave}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Recipe Image *</Text>
          <Pressable
            style={[
              styles.imagePicker,
              showImageError && styles.imagePickerError,
            ]}
            onPress={handlePickImage}
          >
            {thumb ? (
              <Image source={{ uri: thumb }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={36} color="#8e8e93" />
                <Text style={styles.imagePlaceholderText}>
                  Tap to select image
                </Text>
              </View>
            )}
          </Pressable>
          {showImageError && (
            <Text style={styles.errorText}>Image is required</Text>
          )}

          <Text style={styles.label}>Recipe Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Spaghetti Carbonara"
            placeholderTextColor="#aaa"
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Pasta"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Area</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder="Italian"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Pressable onPress={addIngredient} hitSlop={8}>
              <Ionicons name="add-circle" size={26} color="#3b82f6" />
            </Pressable>
          </View>

          {ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.measureInput]}
                value={ing.measure}
                onChangeText={(v) => updateIngredient(i, "measure", v)}
                placeholder="1 cup"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                value={ing.name}
                onChangeText={(v) => updateIngredient(i, "name", v)}
                placeholder="Flour"
                placeholderTextColor="#aaa"
              />
              <Pressable onPress={() => removeIngredient(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color="#ef4444" />
              </Pressable>
            </View>
          ))}

          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Step by step..."
            placeholderTextColor="#aaa"
            multiline
            textAlignVertical="top"
          />

          {isEditMode && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={styles.deleteText}>Delete Recipe</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 48 },
  headerSave: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#000",
  },
  textarea: {
    minHeight: 120,
    paddingTop: 10,
  },
  imagePicker: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#e8e8ed",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 15,
    color: "#3a3a3c",
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
  },
  row: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  measureInput: { width: 90 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
  },
})
