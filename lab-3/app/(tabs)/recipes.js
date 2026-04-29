import { useFocusEffect, useRouter } from "expo-router"
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native"
import { useCallback, useEffect, useState } from "react"

// Icons
import { Ionicons } from "@expo/vector-icons"

// Controllers
import {
  searchRecipesByName,
  getRandomRecipes,
} from "../../controllers/recipesController"

// Hooks
import { useDebounce } from "../../hooks/useDebounce"

// Utils
import { extractIngredients } from "../../utils/functions"

// Database helpers
import { deleteRecipe, insertRecipe, isRecipeSaved } from "../../db"

export default function RecipesScreen() {
  const router = useRouter()

  const [recipes, setRecipes] = useState([])
  const [randomRecipes, setRandomRecipes] = useState([])

  const [savedRecipesIds, setSavedRecipesIds] = useState(new Set())

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDebounce(searchQuery, 500)

  useFocusEffect(
    useCallback(() => {
      const list = [...recipes, ...randomRecipes]
      const saved = new Set(
        list.filter((r) => isRecipeSaved(r.idMeal)).map((r) => r.idMeal)
      )

      setSavedRecipesIds(saved)
    }, [recipes, randomRecipes])
  )

  useEffect(() => {
    const loadRandom = async () => {
      const [data, error] = await getRandomRecipes(8)
      if (error) {
        console.error("Error fetching random recipes:", error)
        return
      }
      setRandomRecipes(data)
    }
    loadRandom()
  }, [])

  useEffect(() => {
    if (debouncedQuery.length === 0) {
      setRecipes([])
      return
    }

    const fetchRecipesByName = async () => {
      const [data, error] = await searchRecipesByName(debouncedQuery)
      if (error) {
        console.error("Error fetching recipes:", error)
        return
      }
      setRecipes(data)
    }

    fetchRecipesByName()
  }, [debouncedQuery])

  const toggleSave = (recipe) => {
    if (savedRecipesIds.has(recipe.idMeal)) {
      deleteRecipe(recipe.idMeal)
      setSavedRecipesIds((prev) => {
        const next = new Set(prev)
        next.delete(recipe.idMeal)
        return next
      })
    } else {
      insertRecipe({
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        strArea: recipe.strArea,
        strInstructions: recipe.strInstructions,
        ingredients: extractIngredients(recipe),
      })
      setSavedRecipesIds((prev) => new Set(prev).add(recipe.idMeal))
    }
  }

  const isSearching = debouncedQuery.length > 0
  const displayedRecipes = isSearching ? recipes : randomRecipes

  return (
    <View style={styles.container}>
      <Text style={styles.discover}>Discover Recipes</Text>

      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={18}
          color="#8e8e93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for delicious recipes..."
          placeholderTextColor="#8e8e93"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {isSearching && displayedRecipes.length === 0 ? (
          <Text style={styles.empty}>
            No recipes match "{debouncedQuery}". Try something else.
          </Text>
        ) : (
          displayedRecipes.map((recipe) => {
            const saved = savedRecipesIds.has(recipe.idMeal)
            return (
              <Pressable
                key={recipe.idMeal}
                style={styles.card}
                onPress={() => router.push(`/recipes/${recipe.idMeal}`)}
              >
                <ImageBackground
                  source={{ uri: recipe.strMealThumb }}
                  style={styles.cardImage}
                  imageStyle={styles.cardImageRadius}
                >
                  <Pressable
                    style={styles.saveButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      toggleSave(recipe)
                    }}
                    hitSlop={10}
                  >
                    <Ionicons
                      name={saved ? "heart" : "heart-outline"}
                      size={22}
                      color={saved ? "#ef4444" : "#fff"}
                    />
                  </Pressable>
                  <View style={styles.cardOverlay}>
                    <Text style={styles.cardTitle}>{recipe.strMeal}</Text>
                    <View style={styles.cardMeta}>
                      {recipe.strCategory ? (
                        <View style={styles.pill}>
                          <Text style={styles.pillText}>
                            {recipe.strCategory}
                          </Text>
                        </View>
                      ) : null}
                      {recipe.strArea ? (
                        <View style={styles.areaRow}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#fff"
                          />
                          <Text style={styles.areaText}>{recipe.strArea}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  discover: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: "#8e8e93",
    marginTop: 32,
    fontSize: 15,
  },
  card: {
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardImageRadius: {
    borderRadius: 16,
  },
  cardOverlay: {
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  saveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  areaText: {
    color: "#fff",
    fontSize: 13,
  },
})
