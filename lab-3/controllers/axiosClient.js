import axios from "axios"

const recipesApi = axios.create({
  baseURL: "https://www.themealdb.com/api/json/v1/1",
  timeout: 10000,
})

export default recipesApi
