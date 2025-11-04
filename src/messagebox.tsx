import { useState } from "react";

type MessageBoxProps = {
  onSend?: (prompt: string) => void;
};

function MessageBox({ onSend }: MessageBoxProps) {
  const [value, setValue] = useState<string>("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
    setValue("");
  };

  return (
    <div className="flex justify-between w-full p-2 text-2xl text-white">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
        placeholder="Let's do more..."
        className="w-4/5 bg-white/20 p-1 px-4 border border-blue-900 rounded-2xl text-blue-1000"
      />
      <button
        onClick={handleSend}
        className="bg-gradient-to-r from-blue-500 to-purple-600 px-2 rounded-2xl"
      >
        Send
      </button>
    </div>
  );
}

export default MessageBox;
