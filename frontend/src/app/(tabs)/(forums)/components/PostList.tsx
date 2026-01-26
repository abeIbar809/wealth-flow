import { addReply, deletePost, deleteReply } from "@/src/api/fourms";
import { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";

export default function PostList({ posts, onPostDeleted }: { posts: any[]; onPostDeleted: () => void }) {
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePost(id);
              onPostDeleted();
            } catch (err) {
              Alert.alert("Failed to delete post");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleReplySubmit = async (postId: string) => {
    const content = replyContent[postId];
    if (!content || !content.trim()) {
      Alert.alert("Reply cannot be empty");
      return;
    }

    try {
      await addReply(postId, content);
      setReplyContent({ ...replyContent, [postId]: "" });
      setShowReplyForm({ ...showReplyForm, [postId]: false });
      onPostDeleted();
    } catch (err) {
      Alert.alert("Failed to add reply");
      console.error(err);
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    Alert.alert(
      "Delete Reply",
      "Are you sure you want to delete this reply?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteReply(postId, replyId);
              onPostDeleted();
            } catch (err) {
              Alert.alert("Failed to delete reply");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const toggleReplyForm = (postId: string) => {
    setShowReplyForm({ ...showReplyForm, [postId]: !showReplyForm[postId] });
  };

  if (!posts || posts.length === 0) {
    return (
      <View style={{ alignItems: "center", padding: 40 }}>
        <Text style={{ fontSize: 18, color: "#666" }}>No posts yet</Text>
        <Text style={{ color: "#666" }}>Be the first to create a post!</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>Community Posts ({posts.length})</Text>
      {posts.map((post) => (
        <View key={post._id} style={styles.postContainer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Button title="Delete" color="#dc3545" onPress={() => handleDelete(post._id)} />
          </View>

          <Text style={styles.postContent}>{post.content}</Text>
          <Text style={styles.timestamp}>Posted on {new Date(post.createdAt).toLocaleString()}</Text>

          <Button
            title={`Reply (${post.replies?.length || 0})`}
            color="#28a745"
            onPress={() => toggleReplyForm(post._id)}
          />

          {showReplyForm[post._id] && (
            <View style={styles.replyForm}>
              <TextInput
                placeholder="Write your reply..."
                value={replyContent[post._id] || ""}
                onChangeText={(text) => setReplyContent({ ...replyContent, [post._id]: text })}
                multiline
                style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button title="Post Reply" onPress={() => handleReplySubmit(post._id)} />
                <Button title="Cancel" color="#6c757d" onPress={() => toggleReplyForm(post._id)} />
              </View>
            </View>
          )}

          {post.replies && post.replies.length > 0 && (
            <View style={{ marginTop: 15, marginLeft: 10 }}>
              {post.replies.map((reply) => (
                <View key={reply._id} style={styles.replyContainer}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ flex: 1 }}>{reply.content}</Text>
                    <Button title="Delete" color="#dc3545" onPress={() => handleDeleteReply(post._id, reply._id)} />
                  </View>
                  <Text style={{ fontSize: 12, color: "#666" }}>{new Date(reply.createdAt).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  postContent: {
    marginVertical: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  replyForm: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  replyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
});

