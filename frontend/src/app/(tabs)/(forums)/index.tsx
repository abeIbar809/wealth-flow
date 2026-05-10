import { useEffect, useState } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import CreatePost from "./components/CreatePost";
import PostList from "./components/PostList";
import { getPosts } from "@/src/api/fourms";
import { AppText } from "@/src/components/common/app-text";

type Category = "financial" | "app" | "social" | "other";

// All available filter options shown as chips above the post list
const CATEGORIES: { label: string; value: Category }[] = [
  { label: "💰 Financial", value: "financial" },
  { label: "📱 App",       value: "app"       },
  { label: "🤝 Social",    value: "social"    },
  { label: "💬 Other",     value: "other"     },
];

export default function App() {
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  // Null means all categories are shown, a value narrows the list
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);

  // Fetches all posts from the backend and clears any previous error
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filters the post array client-side so no extra API call is needed
  const filteredPosts = activeFilter
    ? posts.filter((p: any) => p.category === activeFilter)
    : posts;

  return (
    <View className="flex-1 px-5 pt-5 bg-[#F4F6FA]">
      <AppText type="subtitle" className="text-center mb-5">WealthFlow Community Forum</AppText>

      {/* Post creation form, refreshes the list when a new post is submitted */}
      <CreatePost onPostCreated={loadPosts} />

      {/* Category filter chips — tapping the active one toggles it off */}
      <View className="flex-row flex-wrap gap-2 mb-4">

        {/* All button clears the active filter and shows every post */}
        <TouchableOpacity
          onPress={() => setActiveFilter(null)}
          className={`px-4 py-1.5 rounded-full border ${
            activeFilter === null
              ? "bg-[#03BF62] border-[#03BF62]"
              : "bg-white border-gray-300"
          }`}
        >
          <AppText type="normal" className={activeFilter === null ? "text-white" : "text-gray-600"}>
            All
          </AppText>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            // Tapping the already-active chip deselects it
            onPress={() => setActiveFilter(activeFilter === cat.value ? null : cat.value)}
            className={`px-4 py-1.5 rounded-full border ${
              activeFilter === cat.value
                ? "bg-[#03BF62] border-[#03BF62]"
                : "bg-white border-gray-300"
            }`}
          >
            <AppText
              type="normal"
              className={activeFilter === cat.value ? "text-white" : "text-gray-600"}
            >
              {cat.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#03BF62" />}

      {/* Error shown when the backend is unreachable or returns an error */}
      {error && <AppText type="normal" className="text-red-500">{error}</AppText>}

      {/* Post list only renders once loading finishes and there's no error */}
      {!loading && !error && <PostList posts={filteredPosts} onPostDeleted={loadPosts} />}
    </View>
  );
}