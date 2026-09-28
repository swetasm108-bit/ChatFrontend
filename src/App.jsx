import {
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "./socket";
import "./App.css";

function App() {
  const API_URL =
    "https://chatbackend-7vdm.onrender.com";

  const [username, setUsername] = useState(
    localStorage.getItem("chatUsername") || ""
  );

  const [roomId, setRoomId] = useState(
    localStorage.getItem("chatRoom") || ""
  );

  const [usernameInput, setUsernameInput] =
    useState("");

  const [roomInput, setRoomInput] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [editingMessageId, setEditingMessageId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");

  // Other person's status
  const [otherUser, setOtherUser] =
    useState("");

  const [userStatus, setUserStatus] =
    useState("offline");

  const [lastSeen, setLastSeen] =
    useState(null);

  const messagesEndRef =
    useRef(null);

  // ==========================================
  // LOGIN
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedUsername =
      usernameInput.trim();

    const trimmedRoom =
      roomInput.trim();

    if (
      !trimmedUsername ||
      !trimmedRoom
    ) {
      return;
    }

    localStorage.setItem(
      "chatUsername",
      trimmedUsername
    );

    localStorage.setItem(
      "chatRoom",
      trimmedRoom
    );

    setUsername(trimmedUsername);
    setRoomId(trimmedRoom);
  };

  // ==========================================
  // CHAT + SOCKET
  // ==========================================
  useEffect(() => {
    if (!username || !roomId) {
      return;
    }

    setMessages([]);
    setOtherUser("");
    setUserStatus("offline");
    setLastSeen(null);

    // ------------------------------------------
    // JOIN ROOM
    // ------------------------------------------
    const joinRoom = () => {
      console.log(
        "Joining room:",
        roomId,
        "as",
        username
      );

      socket.emit("join_room", {
        roomId,
        username,
      });
    };

    // ------------------------------------------
    // RECEIVE MESSAGE
    // ------------------------------------------
    const handleReceiveMessage = (data) => {
      if (
        String(data.roomId) !==
        String(roomId)
      ) {
        return;
      }

      setMessages(
        (previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (msg) =>
                msg._id &&
                data._id &&
                String(msg._id) ===
                  String(data._id)
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            data,
          ];
        }
      );
    };

    // ------------------------------------------
    // MESSAGE EDITED
    // ------------------------------------------
    const handleMessageEdited = (
      updatedMessage
    ) => {
      setMessages(
        (previousMessages) =>
          previousMessages.map(
            (msg) =>
              String(msg._id) ===
              String(
                updatedMessage._id
              )
                ? updatedMessage
                : msg
          )
      );
    };

    // ------------------------------------------
    // EDIT ERROR
    // ------------------------------------------
    const handleEditError = (data) => {
      alert(data.message);
    };

    // ------------------------------------------
    // USER STATUS
    // ------------------------------------------
    const handleUserStatus = (data) => {
      console.log(
        "User status:",
        data
      );

      // Ignore our own status
      if (
        data.username === username
      ) {
        return;
      }

      // Make sure status belongs
      // to someone in our room
      if (!data.username) {
        return;
      }

      setOtherUser(
        data.username
      );

      if (
        data.status === "online"
      ) {
        setUserStatus("online");
        setLastSeen(null);
      }

      if (
        data.status === "offline"
      ) {
        setUserStatus("offline");

        setLastSeen(
          data.lastSeen
        );
      }
    };

    // ------------------------------------------
    // SOCKET LISTENERS
    // ------------------------------------------
    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    socket.on(
      "message_edited",
      handleMessageEdited
    );

    socket.on(
      "edit_error",
      handleEditError
    );

    socket.on(
      "user_status",
      handleUserStatus
    );

    socket.on(
      "connect",
      joinRoom
    );

    // Join immediately if already connected
    if (socket.connected) {
      joinRoom();
    }

    // ------------------------------------------
    // FETCH HISTORY
    // ------------------------------------------
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/${encodeURIComponent(
            roomId
          )}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch messages"
          );
        }

        const data =
          await response.json();

        setMessages(
          (previousMessages) => {
            const messageMap =
              new Map();

            previousMessages.forEach(
              (msg) => {
                if (msg._id) {
                  messageMap.set(
                    String(msg._id),
                    msg
                  );
                }
              }
            );

            data.forEach((msg) => {
              if (msg._id) {
                messageMap.set(
                  String(msg._id),
                  msg
                );
              }
            });

            return Array.from(
              messageMap.values()
            ).sort(
              (a, b) =>
                new Date(
                  a.createdAt
                ) -
                new Date(
                  b.createdAt
                )
            );
          }
        );
      } catch (error) {
        console.error(
          "Error fetching messages:",
          error
        );
      }
    };

    fetchMessages();

    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------
    return () => {
      socket.off(
        "connect",
        joinRoom
      );

      socket.off(
        "receive_message",
        handleReceiveMessage
      );

      socket.off(
        "message_edited",
        handleMessageEdited
      );

      socket.off(
        "edit_error",
        handleEditError
      );

      socket.off(
        "user_status",
        handleUserStatus
      );
    };
  }, [username, roomId]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const sendMessage = () => {
    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !username ||
      !roomId
    ) {
      return;
    }

    socket.emit("send_message", {
      roomId,
      sender: username,
      message: trimmedMessage,
    });

    setMessage("");
  };

  // ==========================================
  // EDIT
  // ==========================================
  const startEditing = (msg) => {
    setEditingMessageId(
      msg._id
    );

    setEditingText(
      msg.message
    );
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEdit = (msg) => {
    const trimmedText =
      editingText.trim();

    if (!trimmedText) {
      return;
    }

    socket.emit("edit_message", {
      messageId: msg._id,
      sender: username,
      newMessage: trimmedText,
    });

    setEditingMessageId(null);
    setEditingText("");
  };

  // ==========================================
  // KEYBOARD
  // ==========================================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEditKeyDown = (
    e,
    msg
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(msg);
    }

    if (e.key === "Escape") {
      cancelEditing();
    }
  };

  // ==========================================
  // LOGOUT / LEAVE ROOM
  // ==========================================
  const handleLogout = () => {
    // Tell backend immediately
    socket.emit("leave_room");

    localStorage.removeItem(
      "chatUsername"
    );

    localStorage.removeItem(
      "chatRoom"
    );

    setUsername("");
    setRoomId("");
    setUsernameInput("");
    setRoomInput("");
    setMessage("");
    setMessages([]);
    setEditingMessageId(null);
    setEditingText("");
    setOtherUser("");
    setUserStatus("offline");
    setLastSeen(null);
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================
  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // LAST SEEN
  // ==========================================
  const formatLastSeen = (date) => {
    if (!date) {
      return "Offline";
    }

    return `Last seen ${formatTime(
      date
    )}`;
  };

  // ==========================================
  // EDIT LIMIT
  // ==========================================
  const canEditMessage = (msg) => {
    if (!msg.createdAt) {
      return false;
    }

    const createdTime =
      new Date(
        msg.createdAt
      ).getTime();

    const fiveMinutes =
      5 * 60 * 1000;

    return (
      Date.now() -
        createdTime <=
      fiveMinutes
    );
  };

  // ==========================================
  // LOGIN SCREEN
  // ==========================================
  if (!username || !roomId) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="chat-logo">
            💬
          </div>

          <div className="login-content">

            <h1>
              Welcome to Chat
            </h1>

            <p className="login-subtitle">
              Choose your username
              and join a conversation.
            </p>

            <form
              onSubmit={handleLogin}
            >

              <label>
                Username
              </label>

              <div className="username-input">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  value={
                    usernameInput
                  }
                  placeholder="Enter your username"
                  onChange={(e) =>
                    setUsernameInput(
                      e.target.value
                    )
                  }
                  autoFocus
                />

              </div>

              <label className="room-label">
                Chat room
              </label>

              <div className="username-input">

                <span className="input-icon">
                  💬
                </span>

                <input
                  type="text"
                  value={
                    roomInput
                  }
                  placeholder="Enter room name"
                  onChange={(e) =>
                    setRoomInput(
                      e.target.value
                    )
                  }
                />

              </div>

              <button
                type="submit"
                className="join-button"
                disabled={
                  !usernameInput.trim() ||
                  !roomInput.trim()
                }
              >
                <span>
                  Join the conversation
                </span>

                <span className="arrow">
                  →
                </span>
              </button>

            </form>

            <div className="login-footer">

              <span className="status-dot"></span>

              Real-time messaging
              powered by Socket.IO

            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHAT SCREEN
  // ==========================================
  return (
    <div className="chat-page">

      <div className="chat-container">

        {/* HEADER */}
        <div className="chat-header">

          <div className="profile">

            <div className="avatar">
              {otherUser
                ? otherUser
                    .charAt(0)
                    .toUpperCase()
                : username
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div className="profile-info">

              <h2>
                {otherUser ||
                  roomId}
              </h2>

              <span className="online">

                <span
                  className={`online-dot ${
                    userStatus ===
                    "offline"
                      ? "offline-dot"
                      : ""
                  }`}
                ></span>

                {userStatus ===
                "online"
                  ? "Online"
                  : formatLastSeen(
                      lastSeen
                    )}

              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Leave
          </button>

        </div>

        {/* MESSAGES */}
        <div className="messages">

          {messages.length ===
          0 ? (

            <div className="empty-chat">

              <div className="empty-icon">
                👋
              </div>

              <h3>
                Say hello!
              </h3>

              <p>
                You're the first
                person here.
                Send a message
                to start the
                conversation.
              </p>

            </div>

          ) : (

            messages.map(
              (msg) => {

                const isMyMessage =
                  msg.sender ===
                  username;

                const isEditing =
                  String(
                    editingMessageId
                  ) ===
                  String(
                    msg._id
                  );

                const editable =
                  isMyMessage &&
                  canEditMessage(
                    msg
                  );

                return (
                  <div
                    className={`message-row ${
                      isMyMessage
                        ? "my-message"
                        : "other-message"
                    }`}
                    key={
                      msg._id ||
                      `${msg.createdAt}-${msg.sender}-${msg.message}`
                    }
                  >

                    {editable &&
                      !isEditing && (
                        <button
                          className="edit-button"
                          onClick={() =>
                            startEditing(
                              msg
                            )
                          }
                          title="Edit message"
                        >
                          ✎
                        </button>
                      )}

                    <div className="message-bubble">

                      {!isMyMessage && (
                        <strong>
                          {msg.sender}
                        </strong>
                      )}

                      {isEditing ? (

                        <div className="edit-container">

                          <input
                            type="text"
                            value={
                              editingText
                            }
                            autoFocus
                            onChange={(e) =>
                              setEditingText(
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleEditKeyDown(
                                e,
                                msg
                              )
                            }
                          />

                          <div className="edit-actions">

                            <button
                              onClick={() =>
                                saveEdit(
                                  msg
                                )
                              }
                            >
                              Save
                            </button>

                            <button
                              onClick={
                                cancelEditing
                              }
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <>
                          <span>
                            {msg.message}
                          </span>

                          {msg.edited && (
                            <em className="edited-label">
                              edited
                            </em>
                          )}
                        </>

                      )}

                      <small>
                        {formatTime(
                          msg.createdAt
                        )}
                      </small>

                    </div>

                  </div>
                );
              }
            )

          )}

          <div
            ref={
              messagesEndRef
            }
          />

        </div>

        {/* INPUT */}
        <div className="message-input-area">

          <input
            type="text"
            value={message}
            placeholder="Write a message..."
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
          />

          <button
            onClick={
              sendMessage
            }
            disabled={
              !message.trim()
            }
          >
            ➤
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;