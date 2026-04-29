import { AxiosError } from "axios"

// Axios instance
import recipesApi from "./axiosClient.js"

export const searchRecipesByName = async (name) => {
  try {
    const { data } = await recipesApi.get(`/search.php`, {
      params: { s: name },
    })

    return [data.meals ?? [], null]
  } catch (error) {
    if (error instanceof AxiosError) {
      return [null, error.message]
    }

    return [null, "Error"]
  }
}

export const getRecipeById = async (id) => {
  try {
    const { data } = await recipesApi.get(`/lookup.php`, {
      params: { i: id },
    })

    return [data.meals?.[0] ?? null, null]
  } catch (error) {
    if (error instanceof AxiosError) {
      return [null, error.message]
    }

    return [null, "Error"]
  }
}

export const getRandomRecipes = async (count = 10) => {
  try {
    const requests = Array.from({ length: count }, () =>
      recipesApi.get("/random.php")
    )

    const responses = await Promise.all(requests)

    const meals = responses.map((r) => r.data.meals?.[0]).filter(Boolean)

    const unique = Array.from(new Map(meals.map((m) => [m.idMeal, m])).values())

    return [unique ?? [], null]
  } catch (error) {
    if (error instanceof AxiosError) {
      return [null, error.message]
    }

    return [null, "Error"]
  }
}
