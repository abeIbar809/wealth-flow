import { addReply, deletePost, deleteReply, flagPost } from "@/src/api/fourms";
import { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import { AppText } from "@/src/components/common/app-text";

type Category = "financial" | "app" | "social" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  financial: "💰 Financial",
  app:       "📱 App",
  social:    "🤝 Social",
  other:     "💬 Other",
};

const CATEGORY_COLORS: Record<Category, string> = {
  financial: "bg-green-100 text-green-800",
  app:       "bg-blue-100 text-blue-800",
  social:    "bg-orange-100 text-orange-800",
  other:     "bg-gray-100 text-gray-600",
};

export default function PostList({
  posts,
  onPostDeleted,
}: {
  posts: any[];
  onPostDeleted: () => void;
}) {
  const [replyContent, setReplyContent]         = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm]       = useState<{ [key: string]: boolean }>({});
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [flagTargetId, setFlagTargetId]         = useState<string | null>(null);
  const [flagReason, setFlagReason]             = useState("");
  const [flagSubmitting, setFlagSubmitting]     = useState(false);

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deletePost(id);
            onPostDeleted();
          } catch (err) {
            Alert.alert("Failed to delete post");
          }
        },
      },
    ]);
  };

  const openFlagModal = (postId: string) => {
    setFlagTargetId(postId);
    setFlagReason("");
    setFlagModalVisible(true);
  };

  const handleFlagSubmit = async () => {
    if (!flagTargetId) return;
    if (!flagReason.trim()) {
      Alert.alert("Please enter a reason.");
      return;
    }
    try {
      setFlagSubmitting(true);
      await flagPost(flagTargetId, flagReason.trim());
      setFlagModalVisible(false);
      setFlagTargetId(null);
      setFlagReason("");
      onPostDeleted();
    } catch (err) {
      Alert.alert("Failed to flag post");
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleReplySubmit = async (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim()) {
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
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    Alert.alert("Delete Reply", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteReply(postId, replyId);
            onPostDeleted();
          } catch (err) {
            Alert.alert("Failed to delete reply");
          }
        },
      },
    ]);
  };

  const toggleReplyForm = (postId: string) => {
    setShowReplyForm({ ...showReplyForm, [postId]: !showReplyForm[postId] });
  };

  if (!posts || posts.length === 0) {
    return (
      <View className="items-center p-10">
        <AppText type="subtitle" className="text-gray-400">No posts yet</AppText>
        <AppText type="normal" className="text-gray-400">Be the first to create a post!</AppText>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <AppText type="subtitle" className="mb-4">Community Posts ({posts.length})</AppText>

        {posts.map((post) => {
          const isFlagged = post.flagged === true;
          const cat = (post.category as Category) ?? "other";
          const categoryStyle = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;

          return (
            <View key={post._id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">

              {/* Username + Category */}
              <View className="flex-row justify-between items-center mb-2">
                <AppText type="normal" className="text-gray-500">👤 {post.username || "Anonymous"}</AppText>
                <View className={`px-3 py-1 rounded-full ${categoryStyle.split(" ")[0]}`}>
                  <AppText type="caption" className={categoryStyle.split(" ")[1]}>
                    {CATEGORY_LABELS[cat]}
                  </AppText>
                </View>
              </View>

              {/* Title */}
              <AppText
                type="defaultSemiBold"
                className={isFlagged ? "text-red-500 italic mb-2" : "text-[#03BF62] mb-2"}
              >
                {isFlagged
                  ? "This post has been flagged for conflict of community guidelines"
                  : post.title}
              </AppText>

              {/* Content or Redacted */}
              {isFlagged ? (
                <View className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3 mb-2">
                  <AppText type="defaultSemiBold" className="text-red-700">[REDACTED / FLAGGED]</AppText>
                  {post.flagReason ? (
                    <AppText type="caption" className="text-red-600 italic mt-1">
                      Reason: {post.flagReason}
                    </AppText>
                  ) : null}
                </View>
              ) : (
                <AppText type="normal" className="text-gray-700 mb-2">{post.content}</AppText>
              )}

              <AppText type="caption" className="text-gray-400 mb-3">
                Posted on {new Date(post.createdAt).toLocaleString()}
              </AppText>

              {/* Action Buttons */}
              <View className="flex-row gap-2 flex-wrap">
                <TouchableOpacity
                  onPress={() => toggleReplyForm(post._id)}
                  className="bg-[#03BF62] px-4 py-1.5 rounded-full"
                >
                  <AppText type="normal" className="text-white">
                    Reply ({post.replies?.length || 0})
                  </AppText>
                </TouchableOpacity>

                {!isFlagged && (
                  <TouchableOpacity
                    onPress={() => openFlagModal(post._id)}
                    className="bg-yellow-50 border border-yellow-400 px-4 py-1.5 rounded-full"
                  >
                    <AppText type="normal" className="text-yellow-700">🚩 Flag</AppText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleDelete(post._id)}
                  className="bg-red-50 border border-red-300 px-4 py-1.5 rounded-full"
                >
                  <AppText type="normal" className="text-red-500">Delete</AppText>
                </TouchableOpacity>
              </View>

              {/* Reply Form */}
              {showReplyForm[post._id] && (
                <View className="mt-3 bg-[#F4F6FA] rounded-xl p-3">
                  <TextInput
                    placeholder="Write your reply..."
                    value={replyContent[post._id] || ""}
                    onChangeText={(text) => setReplyContent({ ...replyContent, [post._id]: text })}
                    multiline
                    className="bg-white rounded-lg px-3 py-2 mb-2 min-h-[60px]"
                    textAlignVertical="top"
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleReplySubmit(post._id)}
                      className="bg-[#03BF62] px-4 py-1.5 rounded-full"
                    >
                      <AppText type="normal" className="text-white">Post Reply</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleReplyForm(post._id)}
                      className="bg-gray-200 px-4 py-1.5 rounded-full"
                    >
                      <AppText type="normal" className="text-gray-600">Cancel</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Replies */}
              {post.replies && post.replies.length > 0 && (
                <View className="mt-3 ml-2">
                  {post.replies.map((reply: any) => (
                    <View key={reply._id} className="bg-[#F4F6FA] rounded-xl p-3 mb-2 border-l-4 border-[#03BF62]">
                      <View className="flex-row justify-between items-start">
                        <AppText type="normal" className="text-gray-700 flex-1">{reply.content}</AppText>
                        <TouchableOpacity
                          onPress={() => handleDeleteReply(post._id, reply._id)}
                          className="ml-2"
                        >
                          <AppText type="caption" className="text-red-400">Delete</AppText>
                        </TouchableOpacity>
                      </View>
                      <AppText type="caption" className="text-gray-400 mt-1">
                        {new Date(reply.createdAt).toLocaleString()}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}

            </View>
          );
        })}
      </ScrollView>

      {/* Flag Modal */}
      <Modal
        visible={flagModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFlagModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <AppText type="subtitle" className="text-red-500 mb-2">🚩 Flag Post</AppText>
            <AppText type="normal" className="text-gray-500 mb-4">
              Please provide a reason. The content will be hidden from other users.
            </AppText>
            <TextInput
              placeholder="Enter reason..."
              value={flagReason}
              onChangeText={setFlagReason}
              multiline
              className="bg-[#F4F6FA] rounded-xl px-3 py-3 mb-4 min-h-[80px]"
              textAlignVertical="top"
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setFlagModalVisible(false)}
                className="bg-gray-200 px-5 py-2 rounded-xl"
              >
                <AppText type="normal" className="text-gray-600">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFlagSubmit}
                disabled={flagSubmitting}
                className="bg-red-500 px-5 py-2 rounded-xl"
              >
                <AppText type="normal" className="text-white">
                  {flagSubmitting ? "Flagging..." : "Submit Flag"}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}