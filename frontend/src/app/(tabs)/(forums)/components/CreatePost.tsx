import { createPost } from "@/src/api/fourms";
import useAuthStore, { AuthState } from "@/src/stores/useAuthStore";
import { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { AppText } from "@/src/components/common/app-text";

type Category = "financial" | "app" | "social" | "other";

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "💰 Financial", value: "financial" },
  { label: "📱 App",       value: "app"       },
  { label: "🤝 Social",    value: "social"    },
  { label: "💬 Other",     value: "other"     },
];

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const user = useAuthStore((state: AuthState) => state.user);
  const [title, setTitle]           = useState("");
  const [content, setContent]       = useState("");
  const [category, setCategory]     = useState<Category>("other");
  const [submitting, setSubmitting] = useState(false);

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Please fill in all fields");
      return;
    }
    try {
      setSubmitting(true);
      await createPost({ title, content, username: user?.name || "Anonymous", category });
      setTitle("");
      setContent("");
      setCategory("other");
      onPostCreated();
      Alert.alert("Post created successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="border-2 border-[#03BF62] rounded-2xl p-5 mb-6 bg-white">
      <AppText type="subtitle" className="mb-3">Create a Post</AppText>

      <TextInput
        placeholder="Post Title"
        value={title}
        onChangeText={setTitle}
        className="bg-[#F4F6FA] rounded-xl px-3 h-10 mb-3"
      />

      <TextInput
        placeholder="Post Content"
        value={content}
        onChangeText={setContent}
        multiline
        className="bg-[#F4F6FA] rounded-xl px-3 py-3 mb-3 min-h-[100px]"
        textAlignVertical="top"
      />

      <AppText type="defaultSemiBold" className="mb-2">Category</AppText>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full border ${
              category === cat.value
                ? "bg-[#03BF62] border-[#03BF62]"
                : "bg-white border-gray-300"
            }`}
          >
            <AppText
              type="normal"
              className={category === cat.value ? "text-white" : "text-gray-600"}
            >
              {cat.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={submitPost}
        disabled={submitting}
        className="bg-[#03BF62] rounded-2xl h-9 items-center justify-center"
      >
        <AppText type="defaultSemiBold" className="text-white">
          {submitting ? "Posting..." : "Post"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}