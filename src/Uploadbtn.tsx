type Uploadprops = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Uploadbtn({ onChange }: Uploadprops) {
  return (
    <div className="flex items-center justify-center h-full">
      <input
        multiple
        className="cursor-pointer block bg-white/30 border-2 border-dashed border-blue-900 p-4 text-sm md:text-xl"
        type="file"
        name=""
        id=""
        onChange={onChange}
      />
    </div>
  );
}
export default Uploadbtn;
