// Swap any component across the entire prototype by changing a single import here.
import PresenceControl from '../features/presence/PresenceControl';
import ThreadList from '../features/threads/ThreadList';
import ConversationPanel from '../features/conversation/ConversationPanel';
import CallSection from '../features/call/CallSection';
import WrapUpTimer from '../features/call/WrapUpTimer';
import InboundCallAlert from '../features/call/InboundCallAlert';
import MiniCallBar from '../features/call/MiniCallBar';
import ResponseAssistPanel from '../features/conversation/ResponseAssistPanel';
import DirectoryPanel from '../features/directory/DirectoryPanel';

export const SLOTS = {
  PresenceControl,
  ThreadList,
  ConversationPanel,
  CallSection,
  WrapUpTimer,
  InboundCallAlert,
  MiniCallBar,
  ResponseAssistPanel,
  DirectoryPanel,
} as const;
