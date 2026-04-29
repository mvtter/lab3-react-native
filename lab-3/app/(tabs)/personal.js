import { useCallback, useMemo, useState } from "react"
import { useRouter, useFocusEffect } from "expo-router"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native"

// Icons
import { Ionicons } from "@expo/vector-icons"

// Database helpers
import { getAllRecipes, deleteRecipe } from "../../db"

export default function PersonalRecipesScreen() {
  const router = useRouter()

  const [recipes, setRecipes] = useState([])

  const loadRecipes = useCallback(() => {
    setRecipes(getAllRecipes())
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadRecipes()
    }, [loadRecipes])
  )

  const { customRecipes, savedRecipes } = useMemo(() => {
    return {
      customRecipes: recipes.filter((r) => r.isCustom),
      savedRecipes: recipes.filter((r) => !r.isCustom),
    }
  }, [recipes])

  const handleUnsave = (id) => {
    deleteRecipe(id)
    setRecipes((prev) => prev.filter((r) => r.idMeal !== id))
  }

  const handleEdit = (id) => {
    router.push(`/personal/editor?idMeal=${id}`)
  }

  const renderCard = (r) => (
    <Pressable
      key={r.idMeal}
      style={styles.card}
      onPress={() => router.push(`/recipes/${r.idMeal}`)}
    >
      <ImageBackground
        source={{ uri: r.strMealThumb }}
        style={styles.cardImage}
        imageStyle={{ borderRadius: 12 }}
      >
        <Pressable
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation()
            if (r.isCustom) {
              handleEdit(r.idMeal)
            } else {
              handleUnsave(r.idMeal)
            }
          }}
          hitSlop={10}
        >
          <Ionicons
            name={r.isCustom ? "pencil" : "heart"}
            size={r.isCustom ? 18 : 20}
            color={r.isCustom ? "#fff" : "#ef4444"}
          />
        </Pressable>
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>{r.strMeal}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  )

  const isEmpty = recipes.length === 0

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <Text style={styles.empty}>
            No recipes yet. Tap + to create one, or save some from the Recipes
            tab.
          </Text>
        ) : (
          <>
            {customRecipes.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>My Recipes</Text>
                {customRecipes.map(renderCard)}
              </>
            )}

            {customRecipes.length > 0 && savedRecipes.length > 0 && (
              <View style={styles.divider} />
            )}

            {savedRecipes.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Saved from Discovery</Text>
                {savedRecipes.map(renderCard)}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/personal/editor")}
        hitSlop={8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  list: { paddingBottom: 96 },
  empty: {
    textAlign: "center",
    color: "#8e8e93",
    marginTop: 32,
    fontSize: 15,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5ea",
    marginVertical: 16,
  },
  card: {
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  cardImage: { flex: 1, justifyContent: "flex-end" },
  overlay: { padding: 12, backgroundColor: "rgba(0,0,0,0.4)" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  actionButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
})
