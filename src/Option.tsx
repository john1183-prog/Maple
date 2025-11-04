type btnprops = {
  option: string;
  src: string;
  onClick: () => void;
};
function Option({ option, src, onClick }: btnprops) {
  return (
    <div
      className="w-full text-white bg-purple-600 m-auto rounded-2xl p-4 px-1 text-2xl cursor-pointer hover:scale-101 hover:bg-gradient-to-b from-blue-500 to-purple-600"
      onClick={onClick}
    >
      <div>
        <img src={src} alt="alternative" className="rounded-2xl" />
      </div>
      <p className="p-2">{option}</p>
    </div>
  );
}
export default Option;
