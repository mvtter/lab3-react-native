import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabaseSync("recipes.db")

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS recipes (
      idMeal TEXT PRIMARY KEY NOT NULL,
      strMeal TEXT NOT NULL,
      strMealThumb TEXT,
      strCategory TEXT,
      strArea TEXT,
      strInstructions TEXT,
      ingredients TEXT,
      isCustom INTEGER NOT NULL DEFAULT 0,
      savedAt INTEGER NOT NULL
    );
  `)
}

export const insertRecipe = (recipe) => {
  db.runSync(
    `INSERT OR REPLACE INTO recipes
       (idMeal, strMeal, strMealThumb, strCategory, strArea, strInstructions, ingredients, isCustom, savedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    recipe.idMeal,
    recipe.strMeal,
    recipe.strMealThumb ?? null,
    recipe.strCategory ?? null,
    recipe.strArea ?? null,
    recipe.strInstructions ?? null,
    JSON.stringify(recipe.ingredients ?? []),
    recipe.isCustom ? 1 : 0,
    Date.now()
  )
}

export const updateRecipe = (id, updates) => {
  db.runSync(
    `UPDATE recipes
     SET strMeal = ?,
         strMealThumb = ?,
         strCategory = ?,
         strArea = ?,
         strInstructions = ?,
         ingredients = ?
     WHERE idMeal = ?;`,
    updates.strMeal,
    updates.strMealThumb ?? null,
    updates.strCategory ?? null,
    updates.strArea ?? null,
    updates.strInstructions ?? null,
    JSON.stringify(updates.ingredients ?? []),
    id
  )
}

export const deleteRecipe = (id) => {
  db.runSync(`DELETE FROM recipes WHERE idMeal = ?;`, id)
}

export const getAllRecipes = () => {
  const rows = db.getAllSync(`SELECT * FROM recipes ORDER BY savedAt DESC;`)

  return rows.map((row) => ({
    ...row,
    isCustom: row.isCustom === 1,
    ingredients: JSON.parse(row.ingredients || "[]"),
  }))
}

export const getRecipeById = (id) => {
  const row = db.getFirstSync(`SELECT * FROM recipes WHERE idMeal = ?;`, id)

  if (!row) return null

  return {
    ...row,
    isCustom: row.isCustom === 1,
    ingredients: JSON.parse(row.ingredients || "[]"),
  }
}

export const isRecipeSaved = (id) => {
  const row = db.getFirstSync(
    `SELECT 1 FROM recipes WHERE idMeal = ? LIMIT 1;`,
    id
  )
  return !!row
}

export const generateCustomId = () => `custom_${Date.now()}`
