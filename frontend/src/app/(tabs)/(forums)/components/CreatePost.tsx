import { createPost } from "@/src/api/fourms";
import { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";


export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await createPost({ title, content });
      setTitle("");
      setContent("");
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
    <View style={styles.container}>
      <Text style={styles.heading}>Create a Post</Text>

      <TextInput
        placeholder="Post Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Post Content"
        value={content}
        onChangeText={setContent}
        multiline
        style={[styles.input, styles.textArea]}
      />

      <Button title={submitting ? "Posting..." : "Post"} onPress={submitPost} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: "#007bff",
    padding: 20,
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});

