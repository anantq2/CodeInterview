import {
  CancelCallButton,
  CallingState,
  ReactionsButton,
  ScreenShareButton,
  SpeakingWhileMutedNotification,
  SpeakerLayout,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatPanelRef = useRef(null);

  useEffect(() => {
    if (!isChatOpen || !channel) return;

    const scrollToBottom = () => {
      if (!chatPanelRef.current) return;
      const listEl =
        chatPanelRef.current.querySelector(".str-chat__list") ||
        chatPanelRef.current.querySelector(".str-chat__message-list-scroll");

      if (listEl) listEl.scrollTop = listEl.scrollHeight;
    };

    const initialTimer = setTimeout(scrollToBottom, 120);
    const sub = channel.on("message.new", () => setTimeout(scrollToBottom, 40));

    return () => {
      clearTimeout(initialTimer);
      sub?.unsubscribe?.();
    };
  }, [isChatOpen, channel]);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex gap-3 relative str-video min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
        {/* Participants count badge and Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {participantCount} {participantCount === 1 ? "participant" : "participants"}
            </span>
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
              title={isChatOpen ? "Hide chat" : "Show chat"}
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
          )}
        </div>

        <div className="flex items-start justify-center">
          <div className="w-full max-w-[640px] aspect-video max-h-[220px] bg-base-300 rounded-lg overflow-hidden relative">
            <div className="h-full w-full">
              <SpeakerLayout />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-base-100 p-2 rounded-lg shadow">
            <div className="flex items-center justify-center gap-3">
              <ScreenShareButton />
              <CancelCallButton onLeave={() => navigate("/dashboard")} />
            </div>
          </div>

          <div className="bg-base-100 p-2 rounded-lg shadow">
            <div className="flex items-center justify-center gap-3">
              <SpeakingWhileMutedNotification>
                <ToggleAudioPublishingButton />
              </SpeakingWhileMutedNotification>
              <ToggleVideoPublishingButton />
              <ReactionsButton />
            </div>
          </div>
        </div>
      </div>

      {/* CHAT SECTION */}

      {chatClient && channel && (
        <div
          ref={chatPanelRef}
          className={`flex-shrink-0 h-full min-h-0 flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen
              ? "w-[clamp(320px,42%,420px)] opacity-100 translate-x-0"
              : "w-0 min-w-0 opacity-0 translate-x-3 pointer-events-none"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default VideoCallUI;
