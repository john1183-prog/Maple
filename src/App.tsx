import { useState, type ChangeEvent } from "react";
import Info from "./info";
import Option from "./Option";
import DisplayResult from "./DisplayResult";
import Uploadbtn from "./Uploadbtn";

function App() {
  const [optionchosen, setoptionchosen] = useState<string>("Nothing selected");
  const [files, setFiles] = useState<File[]>([]);
  const [info, setInfo] = useState<string>(
    "First, Select your notes and past questions..."
  );
  const [shouldDisplay, setshouldDisplay] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="flex flex-col items-center justify-around text-center p-5 rounded-lg w-[90vw] h-[90vw] gap-5">
        <div className="h-full w-11/12 p-6 overflow-y-auto bg-[#FFFFFF15]">
          {shouldDisplay ? (
            <DisplayResult files={files} option={optionchosen} />
          ) : !(files.length > 0) ? (
            <Uploadbtn
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFiles(e.target.files ? Array.from(e.target.files) : []);
                setInfo("Then, Pick an option for what you want to do...");
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 p-5">
              <Option
                option="Option 1"
                src="src\assets\notes.jpeg"
                onClick={() => {
                  setshouldDisplay(true);
                  setoptionchosen("Notes");
                  setInfo("What else would you like to do?");
                }}
              />
              <Option
                option="Option 2"
                src="src\assets\guess.jpeg"
                onClick={() => {
                  setshouldDisplay(true);
                  setoptionchosen("Guess");
                  setInfo("What else would you like to do?");
                }}
              />
              <Option
                option="Option 3"
                src="src\assets\quiz.jpeg"
                onClick={() => {
                  setshouldDisplay(true);
                  setoptionchosen("Quiz");
                  setInfo("What else would you like to do?");
                }}
              />
            </div>
          )}
        </div>
        <Info info={info} />
      </div>
    </div>
  );
}

export default App;
