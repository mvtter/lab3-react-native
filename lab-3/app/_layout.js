import { Stack } from "expo-router"
import { useEffect } from "react"

// Database initialization
import { initDatabase } from "../db"

export default function RootLayoutNav() {
  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="recipes/[idMeal]"
        options={{
          headerTitle: "Recipe",
        }}
      />
      <Stack.Screen
        name="personal/editor"
        options={{
          presentation: "modal",
          headerTitle: "Recipe",
        }}
      />
    </Stack>
  )
}
