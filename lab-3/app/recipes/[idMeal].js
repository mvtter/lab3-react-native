import {
  useLocalSearchParams,
  Stack,
  useRouter,
  useFocusEffect,
} from "expo-router"
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native"
import { useCallback, useState } from "react"

// Icons
import { Ionicons } from "@expo/vector-icons"

// Controllers
import { getRecipeById as fetchRecipeFromApi } from "../../controllers/recipesController"

// Database helpers
import { getRecipeById as getRecipeFromDb } from "../../db"

// Utils
import { extractIngredients } from "../../utils/functions"

export default function RecipeDetailsScreen() {
  const router = useRouter()
  const { idMeal } = useLocalSearchParams()

  const [recipeInfo, setRecipeInfo] = useState(null)
  const [isCustom, setIsCustom] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const local = getRecipeFromDb(idMeal)
        if (local) {
          setRecipeInfo(local)
          setIsCustom(local.isCustom)
          return
        }

        const [data, error] = await fetchRecipeFromApi(idMeal)
        if (error) {
          console.error("Error fetching recipe:", error)
          return
        }
        setRecipeInfo(data)
        setIsCustom(false)
      }

      load()
    }, [idMeal])
  )

  const ingredientsList =
    recipeInfo && Array.isArray(recipeInfo.ingredients)
      ? recipeInfo.ingredients
      : recipeInfo
        ? extractIngredients(recipeInfo)
        : []

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: recipeInfo?.strMeal ?? "Recipe Details",
          headerRight: () =>
            isCustom ? (
              <Pressable
                onPress={() => router.push(`/personal/editor?idMeal=${idMeal}`)}
                hitSlop={10}
                style={{ marginRight: 4 }}
              >
                <Ionicons name="pencil" size={20} color="#3b82f6" />
              </Pressable>
            ) : null,
        }}
      />

      {!recipeInfo ? (
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={{ uri: recipeInfo.strMealThumb }}
            style={styles.image}
          />

          <Text style={styles.title}>{recipeInfo.strMeal}</Text>
          <Text style={styles.meta}>
            {[recipeInfo.strCategory, recipeInfo.strArea]
              .filter(Boolean)
              .join(" · ")}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredientsList.length === 0 ? (
            <Text style={styles.empty}>No ingredients listed.</Text>
          ) : (
            <View style={styles.list}>
              {ingredientsList.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>
                    {item.measure ? `${item.measure} · ` : ""}
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>
            {recipeInfo.strInstructions || "No instructions provided."}
          </Text>
        </ScrollView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    color: "#000",
  },
  meta: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e5ea",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  empty: {
    color: "#8e8e93",
    fontSize: 14,
    fontStyle: "italic",
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9b9b9b",
  },
  listText: {
    fontSize: 15,
    color: "#222",
    flex: 1,
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222",
  },
})
