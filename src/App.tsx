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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="flex flex-col items-center justify-around text-center p-1 gap-2 md:p-2 rounded-lg w-fit md:w-3/4 h-full bg-[#FFFFFF15]">
        <Info info={info} />
        <div className="h-full w-full p-2 overflow-y-auto">
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
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <Option
                option="Give me an optimized note"
                src="src\assets\notes.jpeg"
                onClick={() => {
                  setshouldDisplay(true);
                  setoptionchosen("Notes");
                  setInfo("What else would you like to do?");
                }}
              />
              <Option
                option="Guess possible questions"
                src="src\assets\guess.jpeg"
                onClick={() => {
                  setshouldDisplay(true);
                  setoptionchosen("Guess");
                  setInfo("What else would you like to do?");
                }}
              />
              <Option
                option="Quiz me"
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
      </div>
    </div>
  );
}

export default App;
