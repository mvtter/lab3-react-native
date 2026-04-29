import * as ImagePicker from "expo-image-picker"

export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  })

  if (result.canceled) return null
  return result.assets[0].uri
}
