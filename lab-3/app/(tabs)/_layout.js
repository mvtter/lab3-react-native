import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"

function TabBarIcon(props) {
  return <FontAwesome size={28} {...props} />
}

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          title: "Personal",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  )
}
