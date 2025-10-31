type Uploadprops = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Uploadbtn({ onChange }: Uploadprops) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-[#ffffff8f] border-2 border-dashed border-black p-4">
        <input
          multiple
          className="cursor-pointer"
          type="file"
          name=""
          id=""
          onChange={onChange}
        />
      </div>
    </div>
  );
}
export default Uploadbtn;
