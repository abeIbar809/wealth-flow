import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import CreatePost from "./components/CreatePost";
import PostList from "./components/PostList";
import { getPosts } from "@/src/api/fourms";


export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>WealthFlow Community Forum</Text>

      <CreatePost onPostCreated={loadPosts} />

      {loading && <ActivityIndicator size="large" color="#007bff" />}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      {!loading && !error && <PostList posts={posts} onPostDeleted={loadPosts} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e9ecef",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
