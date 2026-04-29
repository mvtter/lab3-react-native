export const extractIngredients = (meal) => {
  let i = 1
  const ingredients = []

  while (meal[`strIngredient${i}`]?.trim()) {
    ingredients.push({
      name: meal[`strIngredient${i}`].trim(),
      measure: meal[`strMeasure${i}`]?.trim() || "",
    })
    i++
  }

  return ingredients
}
