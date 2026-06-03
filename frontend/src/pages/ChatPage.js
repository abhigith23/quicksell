import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context';
import toast from 'react-hot-toast';

let socket;

export default function ChatPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();
  const typingTimer = useRef();

  useEffect(() => {
    fetchRooms();
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (rooms.length && roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) openRoom(room);
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    socket.on('user-typing', () => { setTyping(true); setTimeout(() => setTyping(false), 2000); });
    socket.on('stop-typing', () => setTyping(false));
    return () => { socket.off('new-message'); socket.off('user-typing'); socket.off('stop-typing'); };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/api/chat/rooms');
      setRooms(data);
    } catch { toast.error('Failed to load chats'); }
  };

  const openRoom = async (room) => {
    setActiveRoom(room);
    navigate(`/chat/${room.id}`);
    if (activeRoom?.id) socket.emit('leave-room', activeRoom.id);
    socket.emit('join-room', room.id);
    socket.emit('mark-read', { roomId: room.id });
    try {
      const { data } = await api.get(`/api/chat/rooms/${room.id}/messages`);
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { toast.error('Failed to load messages'); }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeRoom) return;
    socket.emit('send-message', {
      roomId: activeRoom.id,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || '',
      message: text.trim()
    });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { roomId: activeRoom?.id, userId: user.uid });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stop-typing', { roomId: activeRoom?.id }), 1000);
  };

  const otherParticipant = (room) => {
    if (!room) return {};
    return room.buyerId === user?.uid
      ? { name: room.sellerName, photo: room.sellerPhoto }
      : { name: room.buyerName, photo: room.buyerPhoto };
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Messages 💬</h1>
      <div className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm" style={{ height: '70vh' }}>

        {/* Sidebar - chat rooms */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a chat from any listing</p>
            </div>
          ) : rooms.map(room => {
            const other = otherParticipant(room);
            return (
              <button key={room.id} onClick={() => openRoom(room)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border-b border-gray-50 dark:border-gray-800 ${activeRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <img src={other.photo || `https://ui-avatars.com/api/?name=${other.name}&background=3b82f6&color=fff`}
                    alt="" className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{other.name}</p>
                    <p className="text-xs text-gray-400 truncate">{room.listingTitle}</p>
                    {room.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{room.lastMessage}</p>}
                  </div>
                  {room.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{room.unread}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat area */}
        {activeRoom ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              {(() => { const other = otherParticipant(activeRoom); return (
                <>
                  <img src={other.photo || `https://ui-avatars.com/api/?name=${other.name}&background=3b82f6&color=fff`}
                    alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{other.name}</p>
                    <p className="text-xs text-gray-400 truncate">{activeRoom.listingTitle}</p>
                  </div>
                </>
              );})()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div key={i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <img src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}&background=3b82f6&color=fff`}
                        alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 rounded-bl-sm'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <input value={text} onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <button onClick={sendMessage} disabled={!text.trim()}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all">
                ➤
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm mt-1">or start a new chat from a listing page</p>
          </div>
        )}
      </div>
    </div>
  );
}
