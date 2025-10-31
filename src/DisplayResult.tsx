import FileAIResponse from "./FileAIResponse";
type displayProps = {
  files: File[];
  option: string;
};

function DisplayResult({ files, option }: displayProps) {
  return (
    <div className="grid grid-rows-3 h-full gap-2">
      <div className="grid grid-cols-2 gap-1">
        <div className="border border-[#ffffff30] bg-purple-600 text-white rounded-2xl p-6 text-sm">
          <header>Your selected files</header>
          <ul className="flex align-middle justify-center flex-col h-full text-xl overflow-y-auto">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
        <div className="border border-[#ffffff30] bg-purple-600 text-white rounded-2xl p-6 text-sm">
          <header>Your option</header>
          <p className="flex align-middle justify-center flex-col h-full text-xl">
            {option}
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-[#ffffff85] border-white border p-6 row-span-2">
        <header className="text-purple-950 text-xl">Result</header>
        <p>
          <FileAIResponse
            files={files}
            prompt="Summarize this document in plain English:"
          />
        </p>
      </div>
    </div>
  );
}

export default DisplayResult;
